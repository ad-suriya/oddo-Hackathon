import { useEffect, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";
import Input from "../ui/Input.jsx";
import Alert from "../ui/Alert.jsx";
import { friendlyErrorMessage } from "../ui/ErrorState.jsx";

function validateSalaryField(value) {
  if (value === "" || value === null || value === undefined) return "Required.";
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return "Must be zero or greater.";
  return undefined;
}

/**
 * Shared salary-structure edit form, used by both the admin payroll
 * management table and an individual employee's detail page.
 */
export default function PayrollEditModal({ open, employeeName, record, onClose, onSave }) {
  const [values, setValues] = useState({ basicPay: "", allowances: "", deductions: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (record) {
      setValues({ basicPay: String(record.basicPay), allowances: String(record.allowances), deductions: String(record.deductions) });
      setErrors({});
      setSaveError(null);
    }
  }, [record]);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const nextErrors = {
      basicPay: validateSalaryField(values.basicPay),
      allowances: validateSalaryField(values.allowances),
      deductions: validateSalaryField(values.deductions),
    };
    const cleanErrors = Object.fromEntries(Object.entries(nextErrors).filter(([, v]) => v));
    setErrors(cleanErrors);
    if (Object.keys(cleanErrors).length) return;

    setSaveError(null);
    setSaving(true);
    try {
      await onSave({ basicPay: Number(values.basicPay), allowances: Number(values.allowances), deductions: Number(values.deductions) });
    } catch (err) {
      if (err.details) setErrors((e) => ({ ...e, ...err.details }));
      setSaveError(friendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit payroll — ${employeeName ?? ""}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        <FormField label="Basic pay" required error={errors.basicPay}>
          {(props) => <Input {...props} type="number" min="0" value={values.basicPay} onChange={(e) => update("basicPay", e.target.value)} />}
        </FormField>
        <FormField label="Allowances" required error={errors.allowances}>
          {(props) => <Input {...props} type="number" min="0" value={values.allowances} onChange={(e) => update("allowances", e.target.value)} />}
        </FormField>
        <FormField label="Deductions" required error={errors.deductions}>
          {(props) => <Input {...props} type="number" min="0" value={values.deductions} onChange={(e) => update("deductions", e.target.value)} />}
        </FormField>
      </form>
    </Modal>
  );
}
