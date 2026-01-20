import FoundItemCard from "../card/FoundItemCard";
import styles from "./FoundItemGrid.module.css";

export default function FoundItemGrid({
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
        <FoundItemCard
          key={item.id}
          item={item}
          onViewDetails={onViewDetails}   
        />
      ))}
    </div>
  );
}
