import styles from "./FilterSection.module.css";

const EMPTY_FILTERS = {
  category: "",
  location: "",
  date: "",
};

export default function FilterSection({
  filters = EMPTY_FILTERS,
  categories = [],
  locations = [],
  onFilterChange,
  onApply,
  onClear,
}) {
  const handleChange = (field) => (event) => {
    if (onFilterChange) {
      onFilterChange(field, event.target.value);
    }
  };

  const fallbackCategories = [
    "electronics",
    "accessories",
    "clothing",
    "documents",
    "other",
  ];
  const fallbackLocations = [
    "library",
    "cafeteria",
    "gym",
    "parking",
    "classroom",
  ];
  const resolvedCategories = categories.length ? categories : fallbackCategories;
  const locationWhitelist = new Set(fallbackLocations);
  const normalizedLocations = locations
    .map((location) => String(location || "").trim().toLowerCase())
    .filter(Boolean);
  const filteredLocations = Array.from(
    new Set(normalizedLocations)
  ).filter((location) => locationWhitelist.has(location));
  const resolvedLocations = filteredLocations.length
    ? filteredLocations
    : fallbackLocations;

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.grid}>
          <div>
            <label className={styles.label} htmlFor="category-filter">
              Category
            </label>
            <select
              id="category-filter"
              className={styles.input}
              value={filters.category}
              onChange={handleChange("category")}
            >
              <option value="">All Categories</option>
              {resolvedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={styles.label} htmlFor="location-filter">
              Location
            </label>
            <select
              id="location-filter"
              className={styles.input}
              value={filters.location}
              onChange={handleChange("location")}
            >
              <option value="">All Locations</option>
              {resolvedLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={styles.label} htmlFor="date-filter">
              Date
            </label>
            <input
              type="date"
              id="date-filter"
              className={styles.input}
              value={filters.date}
              onChange={handleChange("date")}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.applyBtn}
              type="button"
              onClick={onApply}
            >
              Apply Filters
            </button>
            <button
              className={styles.clearBtn}
              type="button"
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
