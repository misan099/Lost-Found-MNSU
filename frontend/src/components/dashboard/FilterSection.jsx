import styles from "./FilterSection.module.css";

export default function FilterSection() {
  return (
    <section className={`${styles.filterSection} container my-4`}>
      <div className={`${styles.filterCard} card shadow-sm border-0`}>
        <div className="row g-3 align-items-end">

          <div className="col-md-3">
            <label className={styles.label}>Category</label>
            <select className={`form-select ${styles.input}`}>
              <option>All</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className={styles.label}>Location</label>
            <select className={`form-select ${styles.input}`}>
              <option>All</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className={styles.label}>Date</label>
            <input
              type="date"
              className={`form-control ${styles.input}`}
            />
          </div>

          <div className={`col-md-3 ${styles.actions}`}>
            <button className={`btn btn-primary w-100 ${styles.applyBtn}`}>
              Apply
            </button>
            <button className={`btn btn-light w-100 ${styles.clearBtn}`}>
              Clear
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
