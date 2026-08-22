import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Card, { CardHeader, CardBody, CardFooter } from "../components/ui/Card.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import Button from "../components/ui/Button.jsx";
import FormField from "../components/ui/FormField.jsx";
import Input from "../components/ui/Input.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import Alert from "../components/ui/Alert.jsx";
import { SkeletonText } from "../components/ui/Skeleton.jsx";
import ErrorState, { friendlyErrorMessage } from "../components/ui/ErrorState.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useToast } from "../context/ToastContext.jsx";
import { employeeService } from "../services/employeeService.js";
import { formatDate } from "../utils/formatters.js";
import { validateForm, hasErrors, validateMaxLength } from "../utils/validation.js";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { data: employee, loading, error, refetch, setData } = useAsync(() => employeeService.getMe(), []);
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (employee && !editing) {
      setValues({ phone: employee.phone || "", address: employee.address || "", profilePictureUrl: employee.profilePictureUrl || "" });
    }
  }, [employee, editing]);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function startEditing() {
    setValues({ phone: employee.phone || "", address: employee.address || "", profilePictureUrl: employee.profilePictureUrl || "" });
    setErrors({});
    setSaveError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setErrors({});
    setSaveError(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    const nextErrors = validateForm(values, {
      phone: (v) => (v && !/^[\d+\-\s()]{6,20}$/.test(v) ? "Enter a valid phone number." : undefined),
      address: (v) => validateMaxLength(v, 240, "Address"),
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaveError(null);
    setSaving(true);
    try {
      const updated = await employeeService.updateMe(values);
      setData(updated);
      setEditing(false);
      toast.success("Profile updated", "Your changes have been saved.");
    } catch (err) {
      if (err.details) setErrors((e) => ({ ...e, ...err.details }));
      setSaveError(friendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Profile" description="View and manage your personal information." />

      {error && <ErrorState description={friendlyErrorMessage(error)} onRetry={refetch} />}

      {!error && (
        <Card>
          <CardHeader
            title="Personal information"
            actions={
              !loading && !editing ? (
                <Button variant="secondary" size="sm" onClick={startEditing}>
                  Edit profile
                </Button>
              ) : null
            }
          />
          <CardBody>
            {loading ? (
              <SkeletonText lines={5} />
            ) : (
              <>
                <div className={styles.header}>
                  <Avatar name={employee.fullName} src={editing ? values.profilePictureUrl : employee.profilePictureUrl} size="xl" />
                  <div>
                    <div className={styles.name}>{employee.fullName}</div>
                    <div className={styles.meta}>
                      {employee.jobTitle || "No title set"} · {employee.department || "No department"}
                    </div>
                    <div className={styles.meta}>Employee ID: {employee.employeeCode}</div>
                  </div>
                </div>

                {!editing ? (
                  <div className={styles.grid}>
                    <ReadField label="Email" value={employee.email} />
                    <ReadField label="Phone" value={employee.phone} />
                    <ReadField label="Joining date" value={formatDate(employee.dateJoined)} />
                    <ReadField label="Role" value={employee.role} capitalize />
                    <ReadField label="Address" value={employee.address} full />
                  </div>
                ) : (
                  <form onSubmit={handleSave} noValidate>
                    {saveError && (
                      <div style={{ marginTop: "var(--space-4)" }}>
                        <Alert variant="danger">{saveError}</Alert>
                      </div>
                    )}
                    <div className={styles.grid}>
                      <ReadField label="Email" value={employee.email} />
                      <ReadField label="Joining date" value={formatDate(employee.dateJoined)} />

                      <FormField label="Phone" error={errors.phone}>
                        {(props) => <Input {...props} value={values.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91-9000000000" />}
                      </FormField>
                      <FormField label="Profile photo URL" error={errors.profilePictureUrl} hint="Link to an image (optional).">
                        {(props) => (
                          <Input {...props} value={values.profilePictureUrl} onChange={(e) => update("profilePictureUrl", e.target.value)} placeholder="https://…" />
                        )}
                      </FormField>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <FormField label="Address" error={errors.address}>
                          {(props) => <Textarea {...props} value={values.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, city, state" />}
                        </FormField>
                      </div>
                    </div>
                  </form>
                )}
              </>
            )}
          </CardBody>
          {editing && (
            <CardFooter>
              <Button variant="secondary" onClick={cancelEditing} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                Save changes
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}

function ReadField({ label, value, full, capitalize }) {
  return (
    <div className={styles.readRow} style={full ? { gridColumn: "1 / -1" } : undefined}>
      <span className={styles.readLabel}>{label}</span>
      <span className={styles.readValue} style={capitalize ? { textTransform: "capitalize" } : undefined}>
        {value || "—"}
      </span>
    </div>
  );
}
