import styles from "./StatusBadge.module.css";

function statusClass(status: string): string {
  return status === "active" ? styles.statusActive : styles.statusSuperseded;
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${styles.status} ${statusClass(status)}`}>
      {status}
    </span>
  );
}