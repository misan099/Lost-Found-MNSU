import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../../components/admin/AdminLayout";
import api from "../../../services/api";
import LostItemsFilters from "./components/LostItemsFilters";
import LostItemsHeader from "./components/LostItemsHeader";
import LostItemsTable from "./components/LostItemsTable";
import LostItemViewModal from "./components/LostItemViewModal";
import LostItemEditModal from "./components/LostItemEditModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import Toast from "./components/Toast";
import useAdminLostItems from "./hooks/useAdminLostItems";
import {
  formatNepaliDate,
  mapClaimStatus,
} from "./utils/lostItemUtils";
import styles from "./AdminLostItems.module.css";

export default function AdminLostItems() {
  const navigate = useNavigate();
  const { items, claims, loading, errorMessage, reload } =
    useAdminLostItems();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    location: "",
    dateLost: "",
    description: "",
  });
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/admin/login", { replace: true });
  };

  const showToast = (message, variant = "success") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const claimsByLostId = useMemo(() => {
    const map = new Map();
    claims.forEach((claim) => {
      const lostId = claim?.lostItem?.id;
      if (!lostId) return;
      const existing = map.get(lostId);
      if (!existing || Number(claim.id) > Number(existing.id)) {
        map.set(lostId, claim);
      }
    });
    return map;
  }, [claims]);

  const itemsWithClaims = useMemo(
    () =>
      items.map((item) => {
        const claim = claimsByLostId.get(item.id) || null;
        const claimStatus = mapClaimStatus(claim?.status);
        const derivedStatus = claimStatus || item.status || "available";
        return {
          ...item,
          status: derivedStatus,
          claim,
          ownerConfirmed: Boolean(claim?.ownerConfirmed),
          finderConfirmed: Boolean(claim?.finderConfirmed),
          dateLostLabel: formatNepaliDate(item.dateLost),
        };
      }),
    [items, claimsByLostId]
  );

  const categories = useMemo(() => {
    const unique = new Set();
    itemsWithClaims.forEach((item) => {
      if (item.category) unique.add(item.category);
    });
    return ["all", ...Array.from(unique)];
  }, [itemsWithClaims]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return itemsWithClaims
      .filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }
        if (categoryFilter !== "all" && item.category !== categoryFilter) {
          return false;
        }
        if (!search) return true;
        const haystack = [item.name, item.location, item.postedBy]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [itemsWithClaims, statusFilter, categoryFilter, searchTerm]);

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name || "",
      category: item.category || "",
      location: item.location || "",
      dateLost: item.dateLost
        ? new Date(item.dateLost).toISOString().slice(0, 10)
        : "",
      description: item.description || "",
    });
  };

  const closeEdit = () => {
    setEditItem(null);
    setEditForm({
      name: "",
      category: "",
      location: "",
      dateLost: "",
      description: "",
    });
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      const adminToken = localStorage.getItem("adminToken");
      await api.patch(
        `/lost-items/${editItem.id}`,
        {
          item_name: editForm.name,
          category: editForm.category,
          location: editForm.location,
          date_lost: editForm.dateLost,
          public_description: editForm.description,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      showToast("Lost item updated.", "success");
      closeEdit();
      reload();
    } catch (error) {
      showToast("Unable to update item.", "warning");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    const item = confirmModal;
    const adminToken = localStorage.getItem("adminToken");
    const headers = adminToken
      ? { Authorization: `Bearer ${adminToken}` }
      : undefined;

    try {
      await api.delete(`/lost-items/${item.id}`, { headers });
      showToast("Item deleted.", "success");
      setConfirmModal(null);
      reload();
    } catch (error) {
      showToast("Action failed. Please try again.", "warning");
      setConfirmModal(null);
    }
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className={styles.wrapper}>
        <LostItemsHeader />

        <LostItemsFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <LostItemsTable
          items={filteredItems}
          loading={loading}
          onView={setViewItem}
          onEdit={openEdit}
          onDelete={setConfirmModal}
        />
      </div>

      {viewItem && (
        <LostItemViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
        />
      )}

      {confirmModal && (
        <ConfirmDeleteModal
          item={confirmModal}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {editItem && (
        <LostItemEditModal
          item={editItem}
          form={editForm}
          onChange={(field, value) =>
            setEditForm((prev) => ({ ...prev, [field]: value }))
          }
          onClose={closeEdit}
          onSave={saveEdit}
        />
      )}

      {toast && (
        <Toast message={toast.message} variant={toast.variant} />
      )}
    </AdminLayout>
  );
}
