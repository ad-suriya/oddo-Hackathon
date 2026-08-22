import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import PortalTabs from "../../components/layout/PortalTabs.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { validateEmail, validateForm, hasErrors } from "../../utils/validation.js";
import { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";
import { USE_MOCK_API } from "../../config.js";
import { LOGIN_PORTALS, portalForRole } from "../../utils/navigation.js";

const PORTAL_COPY = {
  employee: {
    title: "Welcome back",
    subtitle: "Sign in to your Dayflow account",
    demoHint: "Try alice@dayflow.dev, bob@dayflow.dev, or carol@dayflow.dev — password: Password123",
  },
  staff: {
    title: "Admin / HR sign in",
    subtitle: "For administrators and HR officers managing employees, attendance, leave, and payroll.",
    demoHint: "Try admin@dayflow.dev or hr@dayflow.dev — password: Password123",
  },
};

export default function LoginPage({ portalKey = "employee" }) {
  const { login, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const portal = LOGIN_PORTALS.find((p) => p.key === portalKey) || LOGIN_PORTALS[0];
  const copy = PORTAL_COPY[portal.key] || PORTAL_COPY.employee;

  const [values, setValues] = useState({ email: "", password: "", rememberMe: true });
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
      email: validateEmail,
      password: (v) => (!v ? "Password is required." : undefined),
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const current = await login(values);
      if (!portal.roles.includes(current.role)) {
        await logout();
        const correctPortal = portalForRole(current.role);
        setFormError(`This account doesn't have ${portal.label} access — it's a ${current.role} account. Use the ${correctPortal.label} login instead.`);
        return;
      }
      toast.success("Welcome back", "You're signed in.");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setFormError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        portal.key === "employee" ? (
          <>
            Don&rsquo;t have an account? <Link to="/signup">Create one</Link>
          </>
        ) : (
          <>Admin/HR accounts are created by your organization &mdash; contact your administrator for access.</>
        )
      }
    >
      <PortalTabs activeKey={portal.key} />

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <FormField label="Email" required error={errors.email}>
          {(props) => (
            <Input
              {...props}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
            />
          )}
        </FormField>

        <FormField label="Password" required error={errors.password}>
          {(props) => (
            <Input
              {...props}
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
            />
          )}
        </FormField>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          <input type="checkbox" checked={values.rememberMe} onChange={(e) => update("rememberMe", e.target.checked)} />
          Remember me
        </label>

        <Button type="submit" fullWidth loading={submitting}>
          Sign in
        </Button>

        {USE_MOCK_API && (
          <Alert variant="info" title="Demo credentials">
            {copy.demoHint}
          </Alert>
        )}
      </form>
    </AuthLayout>
  );
}
