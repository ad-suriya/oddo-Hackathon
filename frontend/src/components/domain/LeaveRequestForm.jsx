import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";
import Select from "../ui/Select.jsx";
import Input from "../ui/Input.jsx";
import Textarea from "../ui/Textarea.jsx";
import Alert from "../ui/Alert.jsx";
import { LEAVE_TYPES } from "../../utils/constants.js";
import { required, validateDateRange, validateForm, hasErrors, validateMaxLength } from "../../utils/validation.js";
import { friendlyErrorMessage } from "../ui/ErrorState.jsx";
import { todayIso } from "../../utils/formatters.js";

const initialValues = { leaveType: "paid", startDate: "", endDate: "", remarks: "" };

export default function LeaveRequestForm({ open, onClose, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleClose() {
    setValues(initialValues);
    setErrors({});
    setFormError(null);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateForm(values, {
      leaveType: (v) => required(v, "Select a leave type."),
      endDate: (v, all) => validateDateRange(all.startDate, all.endDate),
      remarks: (v) => validateMaxLength(v, 500, "Reason"),
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
      setValues(initialValues);
    } catch (err) {
      if (err.details) setErrors((e) => ({ ...e, ...err.details }));
      setFormError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Request leave"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="leave-request-form" loading={submitting}>
            Submit request
          </Button>
        </>
      }
    >
      <form id="leave-request-form" onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <FormField label="Leave type" required error={errors.leaveType}>
          {(props) => (
            <Select {...props} value={values.leaveType} onChange={(e) => update("leaveType", e.target.value)}>
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Start date" required error={errors.startDate}>
            {(props) => (
              <Input {...props} type="date" min={todayIso()} value={values.startDate} onChange={(e) => update("startDate", e.target.value)} />
            )}
          </FormField>
          <FormField label="End date" required error={errors.endDate}>
            {(props) => (
              <Input {...props} type="date" min={values.startDate || todayIso()} value={values.endDate} onChange={(e) => update("endDate", e.target.value)} />
            )}
          </FormField>
        </div>

        <FormField label="Reason" error={errors.remarks} hint="Optional — helps your manager review faster.">
          {(props) => (
            <Textarea {...props} placeholder="Briefly describe the reason for leave" value={values.remarks} onChange={(e) => update("remarks", e.target.value)} />
          )}
        </FormField>
      </form>
    </Modal>
  );
}
