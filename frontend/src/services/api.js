import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("arch_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("arch_token");
      localStorage.removeItem("arch_user");
      // Hard redirect to login — clears React Query cache too
      if (!window.location.pathname.includes("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default API;

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  updatePassword: (data) => API.put("/auth/update-password", data),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    API.put(`/auth/reset-password/${token}`, data),
  updateAvatar: (formData) =>
    API.put("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Sites ───────────────────────────────────────────────────
export const sitesAPI = {
  getAll: (params) => API.get("/sites", { params }),
  getForMap: () => API.get("/sites/map"),
  getOne: (id) => API.get(`/sites/${id}`),
  create: (data) => API.post("/sites", data),
  update: (id, data) => API.put(`/sites/${id}`, data),
  delete: (id) => API.delete(`/sites/${id}`),
  addPhoto: (id, data) =>
    data instanceof FormData
      ? API.post(`/sites/${id}/photos`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : API.post(`/sites/${id}/photos`, data),
  addTeamMember: (id, data) => API.post(`/sites/${id}/team`, data),
  removeTeamMember: (id, userId) => API.delete(`/sites/${id}/team/${userId}`),
};

// ─── Artifacts ───────────────────────────────────────────────
export const artifactsAPI = {
  getAll: (params) => API.get("/artifacts", { params }),
  getOne: (id) => API.get(`/artifacts/${id}`),
  create: (data) => API.post("/artifacts", data),
  update: (id, data) => API.put(`/artifacts/${id}`, data),
  delete: (id) => API.delete(`/artifacts/${id}`),
  addImage: (id, formData) =>
    API.post(`/artifacts/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getTags: () => API.get("/artifacts/tags"),
  updatePreservationStatus: (id, preservationStatus) =>
    API.patch(`/artifacts/${id}/preservation-status`, { preservationStatus }),
};

// ─── Logs ────────────────────────────────────────────────────
export const logsAPI = {
  getAll: (params) => API.get("/logs", { params }),
  getOne: (id) => API.get(`/logs/${id}`),
  create: (data) => API.post("/logs", data),
  update: (id, data) => API.put(`/logs/${id}`, data),
  delete: (id) => API.delete(`/logs/${id}`),
  addAttachment: (id, formData) =>
    API.post(`/logs/${id}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Comments ────────────────────────────────────────────────
export const commentsAPI = {
  getForDocument: (model, id) => API.get(`/comments/${model}/${id}`),
  create: (data) => API.post("/comments", data),
  update: (id, data) => API.put(`/comments/${id}`, data),
  delete: (id) => API.delete(`/comments/${id}`),
  like: (id) => API.put(`/comments/${id}/like`),
};

// ─── Notifications ───────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params) => API.get("/notifications", { params }),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put("/notifications/read-all"),
  getUnreadCount: () => API.get("/notifications/unread-count"),
};

// ─── Bookmarks ───────────────────────────────────────────────
export const bookmarksAPI = {
  getAll: () => API.get("/bookmarks"),
  add: (data) => API.post("/bookmarks", data),
  remove: (itemId) => API.delete(`/bookmarks/${itemId}`),
};

// ─── Analytics ───────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => API.get("/analytics/dashboard"),
  getSiteAnalytics: (id) => API.get(`/analytics/site/${id}`),
};

// ─── Users ───────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => API.get("/users", { params }),
  getOne: (id) => API.get(`/users/${id}`),
  getResearchers: () => API.get("/users/researchers"),
  updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  toggleActive: (id) => API.put(`/users/${id}/toggle-active`),
  delete: (id) => API.delete(`/users/${id}`),
};

// ─── Search ──────────────────────────────────────────────────
export const searchAPI = {
  global: (q, type) => API.get("/search", { params: { q, type } }),
};

// ─── Upload ──────────────────────────────────────────────────
export const uploadAPI = {
  image: (formData) =>
    API.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  images: (formData) =>
    API.post("/upload/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  avatar: (formData) =>
    API.post("/upload/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
