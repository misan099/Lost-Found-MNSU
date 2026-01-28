import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

export default function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const getAdminToken = () =>
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const adminToken = getAdminToken();
      const response = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setUsers(data);
    } catch (error) {
      setErrorMessage("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserState = (updatedUser) => {
    if (!updatedUser) return;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  const suspendUser = async ({ userId, durationDays, note }) => {
    const adminToken = getAdminToken();
    const response = await api.patch(
      `/admin/users/${userId}/suspend`,
      { durationDays, note },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    updateUserState(response.data?.user);
  };

  const blockUser = async ({ userId, note }) => {
    const adminToken = getAdminToken();
    const response = await api.patch(
      `/admin/users/${userId}/block`,
      { note },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    updateUserState(response.data?.user);
  };

  const activateUser = async ({ userId, note }) => {
    const adminToken = getAdminToken();
    const response = await api.patch(
      `/admin/users/${userId}/activate`,
      { note },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    updateUserState(response.data?.user);
  };

  return {
    users,
    loading,
    errorMessage,
    reload: fetchUsers,
    suspendUser,
    blockUser,
    activateUser,
  };
}
