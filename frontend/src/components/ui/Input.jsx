import { forwardRef, useState } from "react";
import Icon from "./Icon.jsx";
import styles from "./Input.module.css";

const Input = forwardRef(function Input({ leftIcon, rightIcon, className, type = "text", ...rest }, ref) {
  const [internalType, setInternalType] = useState(type);
  const isPassword = type === "password";

  return (
    <div className={styles.wrapper}>
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      <input
        ref={ref}
        type={isPassword ? internalType : type}
        className={[styles.input, leftIcon ? styles.withLeftIcon : "", isPassword || rightIcon ? styles.withRightIcon : "", className]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {isPassword && (
        <button
          type="button"
          className={[styles.rightIcon, styles.iconButton].join(" ")}
          onClick={() => setInternalType((t) => (t === "password" ? "text" : "password"))}
          aria-label={internalType === "password" ? "Show password" : "Hide password"}
          tabIndex={0}
        >
          <Icon name={internalType === "password" ? "eye" : "eyeOff"} size={16} />
        </button>
      )}
      {!isPassword && rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </div>
  );
});

export default Input;
