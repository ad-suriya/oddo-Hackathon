import { forwardRef } from "react";
import styles from "./Textarea.module.css";

const Textarea = forwardRef(function Textarea({ className, rows = 4, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={[styles.textarea, className].filter(Boolean).join(" ")} {...rest} />;
});

export default Textarea;
