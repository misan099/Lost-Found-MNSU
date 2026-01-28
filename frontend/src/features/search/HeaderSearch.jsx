import { useEffect, useRef, useState } from "react";
import {
  HiOutlineLocationMarker,
  HiOutlineSearch,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { searchItems } from "./searchApi";
import styles from "./HeaderSearch.module.css";

export default function HeaderSearch({
  containerClassName,
  inputClassName,
  iconClassName,
  onResultSelect,
}) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handler = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setErrorMessage("");
      return;
    }

    setOpen(true);
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await searchItems(trimmed);
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage("Unable to search items.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (item) => {
    setOpen(false);
    setQuery("");
    if (typeof onResultSelect === "function") {
      onResultSelect(item);
      return;
    }
    if (item?.type === "user") {
      return;
    }
    if (item?.type === "lost") {
      navigate("/lost");
      return;
    }
    navigate("/found");
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0]);
    }
  };

  return (
    <div
      className={`${styles.searchWrapper} ${containerClassName || ""}`}
      ref={wrapperRef}
    >
      <HiOutlineSearch className={iconClassName} />
      <input
        type="text"
        placeholder="Search by item, location, or date..."
        className={inputClassName}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length || query.trim().length >= 2) {
            setOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <div className={styles.resultsPanel}>
          <div className={styles.resultsHeader}>Search Results</div>
          {loading ? (
            <div className={styles.resultsEmpty}>Searching...</div>
          ) : errorMessage ? (
            <div className={styles.resultsEmpty}>{errorMessage}</div>
          ) : results.length === 0 ? (
            <div className={styles.resultsEmpty}>
              No items found.
            </div>
          ) : (
            results.map((item) => (
              (() => {
                const isUser = item?.type === "user";
                const badgeText = isUser
                  ? "User"
                  : item?.type === "lost"
                    ? "Lost"
                    : "Found";
                const userMeta =
                  item?.username
                    ? `@${item.username}`
                    : item?.email || "Registered user";
                const locationText =
                  item?.location || "Unknown location";

                return (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                className={styles.resultRow}
                onClick={() => handleResultClick(item)}
              >
                <div className={styles.resultImage}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <HiOutlineSearch />
                  )}
                </div>
                <div className={styles.resultInfo}>
                  <div className={styles.resultTitle}>
                    {item.name}
                  </div>
                  <div className={styles.resultMeta}>
                    <span className={styles.resultBadge}>
                      {badgeText}
                    </span>
                    {isUser ? (
                      <span className={styles.resultUserMeta}>
                        {userMeta}
                      </span>
                    ) : (
                      <span className={styles.resultLocation}>
                        <HiOutlineLocationMarker />
                        {locationText}
                      </span>
                    )}
                  </div>
                </div>
              </button>
                );
              })()
            ))
          )}
        </div>
      )}
    </div>
  );
}
