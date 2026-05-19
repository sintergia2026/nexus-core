import styles from "./ChangeFlag.module.css";

export default function ChangeFlag({
  label,
  changed,
}: {
  label: string;
  changed: boolean;
}) {
  return (
    <div className={styles.flag}>
      <div className={styles.flagLabel}>{label}</div>
      <div className={changed ? styles.flagYes : styles.flagNo}>
        {changed ? "yes" : "no"}
      </div>
    </div>
  );
}