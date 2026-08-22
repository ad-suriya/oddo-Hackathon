import { useId } from "react";
import styles from "./FormField.module.css";

/**
 * Layout wrapper providing an accessible label/hint/error around any form
 * control. Pass a render-prop child to receive { id, aria-invalid,
 * aria-describedby } wired up for you:
 *
 *   <FormField label="Email" required error={errors.email}>
 *     {(fieldProps) => <Input {...fieldProps} value={email} onChange={...} />}
 *   </FormField>
 */
export default function FormField({ label, htmlFor, required, error, hint, children }) {
  const generatedId = useId();
  const id = htmlFor || generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {typeof children === "function"
        ? children({ id, "aria-invalid": Boolean(error) || undefined, "aria-describedby": describedBy })
        : children}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
