import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://dvooskid.pythonanywhere.com/api",
  // baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  // timeout: 10000,
});

// Token management
const tokenService = {
  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
  setTokens: (tokens) => {
    localStorage.setItem("access_token", tokens.access);
    if (tokens.refresh) {
      localStorage.setItem("refresh_token", tokens.refresh);
    }
  },
  clearTokens: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  isTokenValid: (token) => {
    if (!token) return false;
    try {
      const { exp } = jwtDecode(token);
      return exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Skip auth for these endpoints
    if (config.url.includes("/token/")) {
      return config;
    }

    const accessToken = tokenService.getAccessToken();
    const refreshToken = tokenService.getRefreshToken();

    if (tokenService.isTokenValid(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    }

    if (refreshToken) {
      try {
        const response = await axios.post(`${config.baseURL}/token/refresh/`, {
          refresh: refreshToken,
        });
        tokenService.setTokens(response.data);
        config.headers.Authorization = `Bearer ${response.data.access}`;
        return config;
      } catch (error) {
        tokenService.clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    tokenService.clearTokens();
    window.location.href = "/login";
    return Promise.reject(new Error("No valid tokens"));
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error came from the token endpoints (login/refresh),
    // don't forcibly redirect to the login page here — let the caller
    // handle the authentication error so the UI can show toast messages.
    const url = error?.config?.url || '';
    const isTokenEndpoint = url.includes('/token/');

    if (error.response?.status === 401 && !isTokenEndpoint) {
      tokenService.clearTokens();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post("/token/", credentials);
      tokenService.setTokens(response.data);
      return response.data;
    } catch (error) {
      tokenService.clearTokens();
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/user/register/", userData);
      return response.data;
    } catch (error) {
      // Handle specific registration errors if needed
      if (error.response?.data) {
        // Pass through server validation errors
        throw error.response.data;
      }
      throw error;
    }
  },

  logout: () => {
    tokenService.clearTokens();
  },

  getUserInfo: () => api.get("/user/role/").then((res) => res.data),
};

export const fileAPI = {
  list: async (folderId) => {
    try {
      const response = await api.get("/files/files/", {
        // Updated URL
        params: { folder: folderId, _: Date.now() },
      });
      console.log("Files response:", response.data);
      return Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
    } catch (error) {
      console.error("File list error:", error);
      throw error;
    }
  },

  listFolders: async (parentId) => {
    try {
      const response = await api.get("/files/folders/", {
        // Updated URL
        params: { parent: parentId || null, _: Date.now() },
      });
      console.log("Folders response:", response.data);
      return Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
    } catch (error) {
      console.error("Folder list error:", error);
      throw error;
    }
  },

  createFolder: async (folderData) => {
    try {
      const response = await api.post("/files/folders/", folderData);
      console.log("Folder created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Create folder error:", error);
      throw error;
    }
  },

  download: async (id, fileObj = null) => {
    try {
      const response = await api.get(`/files/files/${id}/download/`, {
        responseType: "blob",
      });
      // Robust filename parsing (handles filename*=UTF-8''... and filename="..." patterns)
      const contentDisp = response.headers["content-disposition"] || "";
      let filename = null;
      try {
        // Try filename* first (RFC5987)
        const fnStarMatch = contentDisp.match(
          /filename\*=(?:UTF-8'')?([^;\n\r]+)/i
        );
        if (fnStarMatch && fnStarMatch[1]) {
          filename = decodeURIComponent(
            fnStarMatch[1].trim().replace(/^"|"$/g, "")
          );
        } else {
          const fnMatch = contentDisp.match(
            /filename=(?:"([^"]+)")|filename=([^;\n\r]+)/i
          );
          if (fnMatch) {
            filename = (fnMatch[1] || fnMatch[2] || "")
              .trim()
              .replace(/^"|"$/g, "");
          }
        }
      } catch (e) {
        filename = null;
      }

      if (!filename && fileObj && fileObj.name) filename = fileObj.name;
      filename = filename || `file-${id}`;
      return { blob: response.data, filename };
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to download file");
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/files/files/${id}/`); // Updated URL
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error(error.response?.data?.detail || "Failed to delete item");
    }
  },

  upload: async (formData, config = {}) => {
    try {
      const response = await api.post("/files/upload/", formData, {
        // Updated URL
        headers: { "Content-Type": "multipart/form-data" },
        ...config,
      });
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(error.response?.data?.detail || "Upload failed");
    }
  },
  deleteFolder: async (id) => {
    try {
      await api.delete(`/files/folders/${id}/`);
    } catch (error) {
      console.error("Folder delete error:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to delete folder"
      );
    }
  },

  renameFolder: async (folderId, newName) => {
    try {
      const response = await api.patch(`/files/folders/${folderId}/rename/`, {
        name: newName,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  downloadFolderZip: async (folderId) => {
    try {
      const response = await api.get(
        `/files/folders/${folderId}/download_zip/`,
        {
          responseType: "blob",
        }
      );
      const contentDisp = response.headers["content-disposition"] || "";
      let filename = null;
      try {
        const fnStarMatch = contentDisp.match(
          /filename\*=(?:UTF-8'')?([^;\n\r]+)/i
        );
        if (fnStarMatch && fnStarMatch[1]) {
          filename = decodeURIComponent(
            fnStarMatch[1].trim().replace(/^"|"$/g, "")
          );
        } else {
          const fnMatch = contentDisp.match(
            /filename=(?:"([^"]+)")|filename=([^;\n\r]+)/i
          );
          if (fnMatch)
            filename = (fnMatch[1] || fnMatch[2] || "")
              .trim()
              .replace(/^"|"$/g, "");
        }
      } catch (e) {
        filename = null;
      }
      filename = filename || `folder-${folderId}.zip`;
      return { blob: response.data, filename };
    } catch (error) {
      console.error("Download folder zip error:", error);
      throw new Error("Failed to download folder as zip");
    }
  },
};

export const leaveAPI = {
  list: async (userId = null) => {
    const params = {};
    if (userId) params.user = userId;
    const response = await api.get("/leaves/", { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/leaves/", data);
    return response.data;
  },
  approve: async (id) => {
    const response = await api.post(`/leaves/${id}/approve/`);
    return response.data;
  },
  reject: async (id) => {
    const response = await api.post(`/leaves/${id}/reject/`);
    return response.data;
  },
};

// // User API for admin panel
export const userAPI = {
  list: async () => {
    const response = await api.get("/user/list/");
    // The response will now be a direct array since pagination is disabled
    return { results: response.data };
  },
  listByManager: async (managerId) => {
    const response = await api.get("/user/list/", {
      params: { manager: managerId },
    });
    return { results: response.data };
  },
  updateHR: async (userId, isHR) => {
    const response = await api.patch(`/user/${userId}/hr/`, { is_hr: isHR });
    return response.data;
  },
  updateLineManager: async (userId, isLineManager) => {
    const response = await api.patch(`/user/${userId}/line-manager/`, {
      is_line_manager: isLineManager,
    });
    return response.data;
  },
  createUser: async (userData) => {
    try {
      const response = await api.post("/user/create/", userData);
      return response.data;
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  },
  deleteUser: async (userId) => {
    try {
      await api.delete(`/user/${userId}/`);
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  },
  setManager: async (userId, managerId) => {
    try {
      const response = await api.patch(`/user/${userId}/manager/`, {
        manager: managerId,
      });
      return response.data;
    } catch (error) {
      console.error("Set manager error:", error);
      throw error;
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post("/user/password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  getProfile: async (userId = null) => {
    try {
      const url = userId ? `/user/profile/${userId}/` : "/user/profile/";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },
};

export { api, tokenService };
