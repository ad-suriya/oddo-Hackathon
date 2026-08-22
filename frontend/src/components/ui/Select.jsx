import { forwardRef } from "react";
import Icon from "./Icon.jsx";
import styles from "./Input.module.css";
import selectStyles from "./Select.module.css";

const Select = forwardRef(function Select({ className, children, ...rest }, ref) {
  return (
    <div className={styles.wrapper}>
      <select
        ref={ref}
        className={[styles.input, selectStyles.select, styles.withRightIcon, className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </select>
      <span className={styles.rightIcon} style={{ pointerEvents: "none" }}>
        <Icon name="chevronDown" size={16} />
      </span>
    </div>
  );
});

export default Select;
