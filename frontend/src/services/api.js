import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token automatically for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Found Items API
const addFoundItem = async (formData) => {
  const token = localStorage.getItem("token");
  
  // Check if user is authenticated
  if (!token) {
    const error = new Error("Not authenticated");
    error.response = { status: 401, data: { message: "Please log in to report a found item." } };
    throw error;
  }
  
  const response = await api.post("/found-items", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getRecentFoundItems = async () => {
  const response = await api.get("/found-items/recent");
  return response.data;
};

// Lost Items API
const addLostItem = async (formData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    const error = new Error("Not authenticated");
    error.response = {
      status: 401,
      data: { message: "Please log in to report a lost item." },
    };
    throw error;
  }

  const response = await api.post("/lost-items", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Export the axios instance as default for authApi.js to use
export default api;

// Named exports for specific API functions
export { addFoundItem, getRecentFoundItems, addLostItem };
