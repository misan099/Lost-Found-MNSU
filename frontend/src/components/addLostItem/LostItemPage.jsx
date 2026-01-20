import { useState } from "react";
import Layout from "../layout/Layout";

import LostItemHeader from "./LostItemHeader";
import LostItemGrid from "./LostItemGrid";
import LostItemDetailsModal from "./LostItemDetailsModal";
import useLostItems from "./hooks/useLostItems";

function LostItemPage() {
  const { items, loading, error, fetchLostItems } = useLostItems();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleViewDetails = (item) => {
    console.log("Page received item:", item);
    setSelectedItem(item);
  };

  return (
    <Layout>
      <LostItemHeader onItemAdded={fetchLostItems} />

      <LostItemGrid
        items={items}
        loading={loading}
        error={error}
        onViewDetails={handleViewDetails}
      />

      <LostItemDetailsModal
        open={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={fetchLostItems}
      />
    </Layout>
  );
}

export default LostItemPage;
