import styles from "./PageSkeleton.module.css";

export function PageSkeleton() {
  return (
    <section className={styles.wrapper} aria-label="Carregando conteúdo">
      <div className={styles.header}>
        <span className={styles.lineShort} />
        <span className={styles.lineLong} />
      </div>

      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <article key={index} className={styles.card}>
            <span className={styles.media} />
            <span className={styles.textLine} />
            <span className={styles.textLineSmall} />
            <span className={styles.priceLine} />
          </article>
        ))}
      </div>
    </section>
  );
}
