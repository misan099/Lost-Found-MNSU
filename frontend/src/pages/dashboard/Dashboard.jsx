import { useMemo, useState, useCallback } from "react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import HeroSection from "../../components/dashboard/HeroSection";
import FilterSection from "../../components/dashboard/FilterSection";
import RecentLostItems from "../../components/dashboard/RecentLostItems";
import RecentFoundItems from "../../components/dashboard/RecentFoundItems";
import AddFoundItemModal from "../../components/dashboard/addFoundItem/AddFoundItemModal";
import AddLostItemModal from "../../components/addLostItem/AddLostItemModal";
import useFoundItems from "../../components/foundItem/hooks/useFoundItems";
import useLostItems from "../../components/addLostItem/hooks/useLostItems";

export default function UserDashboard() {
  const [isFoundItemModalOpen, setIsFoundItemModalOpen] = useState(false);
  const [isLostItemModalOpen, setIsLostItemModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    date: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    location: "",
    date: "",
  });
  const {
    items: foundItems,
    loading: foundLoading,
    error: foundError,
    fetchFoundItems,
  } = useFoundItems();
  const {
    items: lostItems,
    loading: lostLoading,
    error: lostError,
    fetchLostItems,
  } = useLostItems();

  const handleOpenFoundItemModal = () => {
    setIsFoundItemModalOpen(true);
  };

  const handleCloseFoundItemModal = () => {
    setIsFoundItemModalOpen(false);
  };

  const handleOpenLostItemModal = () => {
    setIsLostItemModalOpen(true);
  };

  const handleCloseLostItemModal = () => {
    setIsLostItemModalOpen(false);
  };

  const handleFoundItemSuccess = useCallback(() => {
    fetchFoundItems();
  }, [fetchFoundItems]);

  const handleLostItemSuccess = useCallback(() => {
    fetchLostItems();
  }, [fetchLostItems]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    const cleared = { category: "", location: "", date: "" };
    setFilters(cleared);
    setAppliedFilters(cleared);
  }, []);

  const categoryOptions = useMemo(() => {
    const base = [
      "Electronics",
      "Documents",
      "Accessories",
      "Clothing",
      "Bags",
      "Keys",
      "Jewelry",
      "Other",
    ];
    const categories = new Set(base);
    [...foundItems, ...lostItems].forEach((item) => {
      if (item?.category) {
        categories.add(String(item.category).trim());
      }
    });
    return Array.from(categories).filter(Boolean).sort();
  }, [foundItems, lostItems]);

  const locationOptions = useMemo(() => {
    const locations = new Set();
    [...foundItems, ...lostItems].forEach((item) => {
      if (item?.location) {
        locations.add(String(item.location).trim());
      }
    });
    return Array.from(locations).filter(Boolean).sort();
  }, [foundItems, lostItems]);

  return (
    <>
      <Header />

      <HeroSection
        onReportFoundItem={handleOpenFoundItemModal}
        onReportLostItem={handleOpenLostItemModal}
      />
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        categories={categoryOptions}
        locations={locationOptions}
      />

      <RecentLostItems
        items={lostItems}
        loading={lostLoading}
        error={lostError}
        filters={appliedFilters}
        onRefresh={fetchLostItems}
      />
      <RecentFoundItems
        items={foundItems}
        loading={foundLoading}
        error={foundError}
        filters={appliedFilters}
        onRefresh={fetchFoundItems}
      />

      <AddFoundItemModal
        isOpen={isFoundItemModalOpen}
        onClose={handleCloseFoundItemModal}
        onSuccess={handleFoundItemSuccess}
      />
      <AddLostItemModal
        isOpen={isLostItemModalOpen}
        onClose={handleCloseLostItemModal}
        onSuccess={handleLostItemSuccess}
      />

      <Footer />
    </>
  );
}
