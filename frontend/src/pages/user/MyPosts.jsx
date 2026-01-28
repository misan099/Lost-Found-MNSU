import { useMemo, useState } from "react";

import LayoutNoFooter from "../../components/layout/LayoutNoFooter";
import useMyPosts from "../../hooks/useMyPosts";
import MyPostsHeader from "../../components/my-posts/MyPostsHeader";
import PostsGrid from "../../components/my-posts/PostsGrid";
import EditPostModal from "../../components/my-posts/EditPostModal";
import ConfirmDeleteModal from "../../components/my-posts/ConfirmDeleteModal";
import EmptyState from "../../components/my-posts/EmptyState";
import styles from "../../components/my-posts/MyPosts.module.css";

const applyFilters = (posts, filter) => {
  if (filter === "all") return posts;
  return posts.filter((post) => post.type === filter);
};

export default function MyPosts() {
  const { posts, loading, error, fetchPosts, updatePost, deletePost } =
    useMyPosts();
  const [activeFilter, setActiveFilter] = useState("all");
  const [editPost, setEditPost] = useState(null);
  const [deletePostTarget, setDeletePostTarget] = useState(null);

  const filteredPosts = useMemo(
    () => applyFilters(posts, activeFilter),
    [posts, activeFilter]
  );

  const handleSave = async (form) => {
    if (!editPost) return;
    const payload =
      editPost.type === "found"
        ? {
            item_name: form.name,
            category: form.category,
            location: form.location,
            date_found: form.date,
            public_description: form.description,
          }
        : {
            item_name: form.name,
            category: form.category,
            location: form.location,
            date_lost: form.date,
            public_description: form.description,
          };

    await updatePost(editPost.id, editPost.type, payload);
    setEditPost(null);
    fetchPosts();
  };

  const handleDelete = async (post) => {
    await deletePost(post.id, post.type);
    setDeletePostTarget(null);
    fetchPosts();
  };

  return (
    <LayoutNoFooter>
      <MyPostsHeader
        title="My Posts"
        subtitle="Items you have reported as lost or found"
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <main className={styles.mainContent}>
        {loading ? (
          <div>Loading your posts...</div>
        ) : error ? (
          <div>{error}</div>
        ) : filteredPosts.length === 0 ? (
          <EmptyState />
        ) : (
          <PostsGrid
            posts={filteredPosts}
            onEdit={setEditPost}
            onDelete={setDeletePostTarget}
          />
        )}
      </main>

      <EditPostModal
        post={editPost}
        onClose={() => setEditPost(null)}
        onSave={handleSave}
      />

      <ConfirmDeleteModal
        post={deletePostTarget}
        onCancel={() => setDeletePostTarget(null)}
        onConfirm={handleDelete}
      />
    </LayoutNoFooter>
  );
}
