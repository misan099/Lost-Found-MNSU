import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import {
  deleteMyFoundItem,
  deleteMyLostItem,
  getMyFoundItems,
  getMyLostItems,
  updateMyFoundItem,
  updateMyLostItem,
} from "../services/myPostsApi";

const normalizeStatus = (statusValue) => {
  if (!statusValue) return "pending";
  return String(statusValue)
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .trim();
};

const formatImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return imagePath;
  }
  const apiBase = api.defaults.baseURL || "";
  const fileBase = apiBase.replace(/\/api\/?$/, "");
  return `${fileBase}${imagePath}`;
};

const normalizeItems = (items, type) =>
  items.map((item) => ({
    id: item.id || item._id,
    type,
    name: item.item_name || item.title || "",
    category: item.category || "",
    location: item.area || item.location || item.exact_location || "",
    date: type === "lost" ? item.date_lost : item.date_found,
    status: item.hasVerifiedClaim
      ? "verified"
      : normalizeStatus(item.status),
    description: item.public_description || item.description || "",
    image: formatImageUrl(
      item.image_url || item.image_path || item.image || ""
    ),
    raw: item,
  }));

export default function useMyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [lostItems, foundItems] = await Promise.all([
        getMyLostItems(),
        getMyFoundItems(),
      ]);

      const normalized = [
        ...normalizeItems(lostItems, "lost"),
        ...normalizeItems(foundItems, "found"),
      ].sort((a, b) => {
        const aDate = a.raw?.created_at || a.raw?.createdAt || a.date;
        const bDate = b.raw?.created_at || b.raw?.createdAt || b.date;
        const aTime = aDate ? new Date(aDate).getTime() : 0;
        const bTime = bDate ? new Date(bDate).getTime() : 0;
        return bTime - aTime;
      });

      setPosts(normalized);
    } catch (err) {
      setError("Unable to load your posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updatePost = useCallback(async (postId, type, payload) => {
    if (type === "lost") {
      return updateMyLostItem(postId, payload);
    }
    return updateMyFoundItem(postId, payload);
  }, []);

  const deletePost = useCallback(async (postId, type) => {
    if (type === "lost") {
      return deleteMyLostItem(postId);
    }
    return deleteMyFoundItem(postId);
  }, []);

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      fetchPosts,
      updatePost,
      deletePost,
    }),
    [posts, loading, error, fetchPosts, updatePost, deletePost]
  );

  return value;
}
