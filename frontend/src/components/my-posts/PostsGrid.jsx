import PostCard from "./PostCard";
import styles from "./MyPosts.module.css";

export default function PostsGrid({ posts, onEdit, onDelete }) {
  return (
    <div className={styles.postsGrid}>
      {posts.map((post) => (
        <PostCard
          key={`${post.type}-${post.id}`}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
