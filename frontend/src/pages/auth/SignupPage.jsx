import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  required,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateForm,
  hasErrors,
} from "../../utils/validation.js";
import { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";

const initialValues = { fullName: "", employeeCode: "", email: "", password: "", confirmPassword: "" };

export default function SignupPage() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateForm(values, {
      fullName: (v) => required(v, "Full name is required."),
      employeeCode: (v) => required(v, "Employee ID is required."),
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (v, all) => validateConfirmPassword(all.password, v),
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await signup(values);
      toast.success("Account created", "Welcome to Dayflow.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.details) setErrors((e) => ({ ...e, ...err.details }));
      setFormError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up access to your Dayflow workspace"
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <FormField label="Full name" required error={errors.fullName}>
          {(props) => (
            <Input {...props} autoComplete="name" placeholder="Jordan Lee" value={values.fullName} onChange={(e) => update("fullName", e.target.value)} />
          )}
        </FormField>

        <FormField label="Employee ID" required error={errors.employeeCode} hint="Provided by HR when you were onboarded.">
          {(props) => (
            <Input {...props} placeholder="EMP0006" value={values.employeeCode} onChange={(e) => update("employeeCode", e.target.value)} />
          )}
        </FormField>

        <FormField label="Email" required error={errors.email}>
          {(props) => (
            <Input {...props} type="email" autoComplete="email" placeholder="you@company.com" value={values.email} onChange={(e) => update("email", e.target.value)} />
          )}
        </FormField>

        <FormField label="Password" required error={errors.password} hint="At least 8 characters, with letters and numbers.">
          {(props) => (
            <Input {...props} type="password" autoComplete="new-password" placeholder="Create a password" value={values.password} onChange={(e) => update("password", e.target.value)} />
          )}
        </FormField>

        <FormField label="Confirm password" required error={errors.confirmPassword}>
          {(props) => (
            <Input
              {...props}
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={values.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
            />
          )}
        </FormField>

        <Button type="submit" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
