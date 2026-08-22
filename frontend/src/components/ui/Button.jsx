import { forwardRef } from "react";
import Spinner from "./Spinner.jsx";
import styles from "./Button.module.css";

const VARIANT_CLASS = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
  dangerGhost: styles.dangerGhost,
};

const Button = forwardRef(function Button(
  {
    as: Component = "button",
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    iconOnly = false,
    leftIcon,
    rightIcon,
    className,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const classes = [
    styles.button,
    VARIANT_CLASS[variant] || styles.primary,
    size === "sm" ? styles.sm : size === "lg" ? styles.lg : "",
    fullWidth ? styles.fullWidth : "",
    iconOnly ? styles.iconOnly : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Polymorphic: <Button as={Link} to="/x"> renders a Link styled as a
  // button instead of nesting an <a> inside a <button>. Native <button>
  // still gets type/disabled; other elements (e.g. Link) don't accept them.
  const extraProps = Component === "button" ? { type, disabled: disabled || loading } : {};

  return (
    <Component ref={ref} className={classes} aria-busy={loading} {...extraProps} {...rest}>
      {loading ? <Spinner size={size === "lg" ? 18 : 14} /> : leftIcon}
      {!iconOnly && children}
      {iconOnly && !loading && children}
      {!loading && rightIcon}
    </Component>
  );
});

export default Button;
