import ResolvedItemCard from "./ResolvedItemCard";
import styles from "../../pages/user/resolved-items/ResolvedItems.module.css";

export default function ResolvedItemsGrid({ items, onSelect, formatDate }) {
  return (
    <div className={styles.itemsGrid}>
      {items.map((item) => (
        <ResolvedItemCard
          key={item.id}
          item={item}
          onSelect={() => onSelect(item)}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}
