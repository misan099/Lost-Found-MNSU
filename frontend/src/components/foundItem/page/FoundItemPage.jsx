import { useState } from "react";
import Layout from "../../layout/Layout";

import FoundItemHeader from "../header/FoundItemHeader";
import FoundItemGrid from "../list/FoundItemGrid";
import FoundItemDetailsModal from "../modal/FoundItemDetailsModal";
import useFoundItems from "../hooks/useFoundItems";

function FoundItemPage() {
  const { items, loading, error, fetchFoundItems } = useFoundItems();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleViewDetails = (item) => {
    console.log("🔥 Page received item:", item);
    setSelectedItem(item);
  };

  return (
    <Layout>
      <FoundItemHeader onItemAdded={fetchFoundItems} />

      <FoundItemGrid
        items={items}
        loading={loading}
        error={error}
        onViewDetails={handleViewDetails}
      />

      <FoundItemDetailsModal
        open={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={fetchFoundItems}
      />
    </Layout>
  );
}

export default FoundItemPage;
