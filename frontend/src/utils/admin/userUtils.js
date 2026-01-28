const formatUserDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-NP", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getRoleLabel = (role) => {
  if (role === "admin") return "Admin";
  return "User";
};

const getStatusLabel = (status) => {
  if (status === "suspended") return "Suspended";
  if (status === "blocked") return "Blocked";
  return "Active";
};

export { formatUserDate, getRoleLabel, getStatusLabel };
