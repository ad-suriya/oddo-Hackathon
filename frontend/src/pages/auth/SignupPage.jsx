import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SplitAuthLayout from "../../components/layout/SplitAuthLayout.jsx";
import Button from "../../components/ui/Button.jsx";
import Icon from "../../components/ui/Icon.jsx";
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
import styles from "../../components/layout/SplitAuthLayout.module.css";

const initialValues = { fullName: "", employeeCode: "", email: "", password: "", confirmPassword: "" };

const FIELDS = [
  { name: "fullName", label: "Full name", autoComplete: "name", placeholder: "Jordan Lee" },
  { name: "employeeCode", label: "Employee ID", placeholder: "EMP0006", hint: "Provided by HR when you were onboarded." },
  { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@company.com" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "Create a password", hint: "At least 8 characters, with letters and numbers." },
  { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password", placeholder: "Re-enter your password" },
];

/** Same dark shell as LoginPage — same product, same form. Signup has no
 * portal split (public signup is always an employee account). */
export default function SignupPage() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const idPrefix = useId();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState({});

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
    <SplitAuthLayout
      title="Create your account"
      subtitle="Set up access to your Dayflow workspace"
      footer={
        <div>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className={styles.fieldError} role="alert">
            {formError}
          </div>
        )}

        {FIELDS.map((field) => {
          const id = `${idPrefix}-${field.name}`;
          const error = errors[field.name];
          const isPassword = field.type === "password";
          const revealed = showPassword[field.name];
          return (
            <div className={styles.field} key={field.name}>
              <label className={styles.label} htmlFor={id}>
                {field.label}
              </label>
              <div className={styles.inputWrap}>
                <input
                  id={id}
                  className={[styles.input, isPassword ? styles.inputWithIcon : ""].filter(Boolean).join(" ")}
                  type={isPassword ? (revealed ? "text" : "password") : field.type || "text"}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(e) => update(field.name, e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : field.hint ? `${id}-hint` : undefined}
                />
                {isPassword && (
                  <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={() => setShowPassword((s) => ({ ...s, [field.name]: !s[field.name] }))}
                    aria-label={revealed ? "Hide password" : "Show password"}
                  >
                    <Icon name={revealed ? "eyeOff" : "eye"} size={16} />
                  </button>
                )}
              </div>
              {error && (
                <span className={styles.fieldError} id={`${id}-error`}>
                  {error}
                </span>
              )}
            </div>
          );
        })}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </SplitAuthLayout>
  );
}
