import styles from "@/app/internal-records-view/page.module.css";

export default function Chips({ values }: { values: string[] }) {
  if (!values || values.length === 0) {
    return <div className={styles.empty}>(none)</div>;
  }

  return (
    <div className={styles.chips}>
      {values.map((value) => (
        <span key={value} className={styles.chip}>
          {value}
        </span>
      ))}
    </div>
  );
}