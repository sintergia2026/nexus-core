    import styles from "@/app/internal-records-view/page.module.css";

export default function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div>{children}</div>
    </div>
  );
}