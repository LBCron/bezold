import styles from "./FormField.module.css";
import { cn } from "@/lib/utils";

export default function FormField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  onBlur,
  suffix,
  hint,
  notice,
}: {
  id: string;
  label: React.ReactNode;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  suffix?: React.ReactNode;
  hint?: string;
  /** Rendered between the label and the input — for warnings the user should
   *  read before typing (the caller styles it). */
  notice?: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {notice}
      <div className={styles.inputWrap}>
        <input
          className={cn(styles.input, suffix && styles.inputWithSuffix)}
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {suffix && <div className={styles.suffix}>{suffix}</div>}
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
