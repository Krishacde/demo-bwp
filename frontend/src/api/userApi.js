const API_BASE_URL = "http://localhost:5000/api";

export const getAuthToken = () => localStorage.getItem("token");

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getAuthUser = async () => {
  const token = getAuthToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    localStorage.removeItem("token");
    throw new Error(data.message || "Failed to fetch profile");
  }
  return data.user;
};

export const getUsers = async (search = "", skill = "") => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (skill) params.append("skill", skill);

  const url = `${API_BASE_URL}/users${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }
  return data.users || [];
};

export const getUserById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "User not found");
  }
  return data.user;
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }
  return data.user;
};

export const followUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}/follow`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to follow user");
  }
  return data.user;
};

export const unfollowUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}/unfollow`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to unfollow user");
  }
  return data.user;
};
