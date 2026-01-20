import { useState, useCallback } from "react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import HeroSection from "../../components/dashboard/HeroSection";
import FilterSection from "../../components/dashboard/FilterSection";
import RecentLostItems from "../../components/dashboard/RecentLostItems";
import RecentFoundItems from "../../components/dashboard/RecentFoundItems";
import AddFoundItemModal from "../../components/dashboard/addFoundItem/AddFoundItemModal";

export default function UserDashboard() {
  const [isFoundItemModalOpen, setIsFoundItemModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenFoundItemModal = () => {
    setIsFoundItemModalOpen(true);
  };

  const handleCloseFoundItemModal = () => {
    setIsFoundItemModalOpen(false);
  };

  const handleFoundItemSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <>
      <Header />

      <HeroSection onReportFoundItem={handleOpenFoundItemModal} />
      <FilterSection />

      <RecentLostItems />
      <RecentFoundItems refreshKey={refreshKey} />

      <AddFoundItemModal
        isOpen={isFoundItemModalOpen}
        onClose={handleCloseFoundItemModal}
        onSuccess={handleFoundItemSuccess}
      />

      <Footer />
    </>
  );
}
