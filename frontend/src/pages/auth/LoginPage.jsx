import { useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SplitAuthLayout from "../../components/layout/SplitAuthLayout.jsx";
import Button from "../../components/ui/Button.jsx";
import Icon, { GoogleLogo } from "../../components/ui/Icon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { validateEmail, validateForm, hasErrors } from "../../utils/validation.js";
import { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";
import { USE_MOCK_API } from "../../config.js";
import { LOGIN_PORTALS, portalForRole } from "../../utils/navigation.js";
import styles from "../../components/layout/SplitAuthLayout.module.css";

const PORTAL_COPY = {
  employee: {
    badge: null,
    title: "Welcome back",
    subtitle: "Sign in to your Dayflow account",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberLabel: "Remember me",
    buttonLabel: "Sign in",
    showSecurityHint: false,
    demoHint: "Try alice@dayflow.dev, bob@dayflow.dev, or carol@dayflow.dev — password: Password123",
  },
  staff: {
    badge: { icon: "building", label: "HR & Administration" },
    title: "Welcome back, HR",
    subtitle: "Sign in to manage your organization's people and operations.",
    emailLabel: "Work email",
    emailPlaceholder: "Enter your work email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberLabel: "Keep me signed in",
    buttonLabel: "Sign In to Admin",
    showSecurityHint: true,
    demoHint: "Try admin@dayflow.dev or hr@dayflow.dev — password: Password123",
  },
};

export default function LoginPage({ portalKey = "employee" }) {
  const { login, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const idPrefix = useId();
  const portal = LOGIN_PORTALS.find((p) => p.key === portalKey) || LOGIN_PORTALS[0];
  const copy = PORTAL_COPY[portal.key] || PORTAL_COPY.employee;

  const [values, setValues] = useState({ email: "", password: "", rememberMe: true });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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

  function handleResetPassword() {
    toast.info("Password reset", "Contact your IT/HR administrator to reset your password.");
  }

  const emailId = `${idPrefix}-email`;
  const passwordId = `${idPrefix}-password`;

  return (
    <SplitAuthLayout
      badge={copy.badge}
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        portal.key === "employee" ? (
          <>
            <div>
              Don&rsquo;t have an account? <Link to="/signup">Create one</Link>
            </div>
            <div className={styles.footerSecondary}>
              Admin or HR? <Link to="/admin/login">Sign in here</Link>
            </div>
          </>
        ) : (
          <>
            <div>Admin/HR accounts are created by your organization &mdash; contact your administrator for access.</div>
            <div className={styles.footerSecondary}>
              Not an admin? <Link to="/login">Employee sign in</Link>
            </div>
          </>
        )
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className={styles.fieldError} role="alert">
            {formError}
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor={emailId}>
            {copy.emailLabel}
          </label>
          <div className={styles.inputWrap}>
            <input
              id={emailId}
              className={styles.input}
              type="email"
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${emailId}-error` : undefined}
            />
          </div>
          {errors.email && (
            <span className={styles.fieldError} id={`${emailId}-error`}>
              {errors.email}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={passwordId}>
            {copy.passwordLabel}
          </label>
          <div className={styles.inputWrap}>
            <input
              id={passwordId}
              className={[styles.input, styles.inputWithIcon].join(" ")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={copy.passwordPlaceholder}
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `${passwordId}-error` : undefined}
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
            </button>
          </div>
          {errors.password && (
            <span className={styles.fieldError} id={`${passwordId}-error`}>
              {errors.password}
            </span>
          )}
        </div>

        <div className={styles.optionsRow}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={values.rememberMe} onChange={(e) => update("rememberMe", e.target.checked)} />
            {copy.rememberLabel}
          </label>
          <button type="button" className={styles.resetButton} onClick={handleResetPassword}>
            Reset password
          </button>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
          {copy.buttonLabel}
        </Button>

        {copy.showSecurityHint && (
          <div className={styles.securityHint}>
            <Icon name="shield" size={14} />
            Authorized HR and administrative personnel only
          </div>
        )}

        {USE_MOCK_API && (
          <div className={styles.infoPanel}>
            <Icon name="info" size={15} />
            <div>
              <strong>Demo credentials</strong>
              {copy.demoHint}
            </div>
          </div>
        )}

        <div className={styles.divider}>Or continue with</div>

        <button type="button" className={styles.googleButton} disabled aria-disabled="true" title="Google sign-in is coming soon">
          <GoogleLogo size={18} />
          Continue with Google
        </button>
      </form>
    </SplitAuthLayout>
  );
}
