import LostItemCard from "./LostItemCard";
import styles from "./LostItemGrid.module.css";

export default function LostItemGrid({
  items,
  loading,
  error,
  onViewDetails,
}) {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <LostItemCard
          key={item.id}
          item={item}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
