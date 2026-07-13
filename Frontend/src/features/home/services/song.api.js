import axios from "axios";

const api = axios.create({
  baseURL: "/api/songs",
  withCredentials: true,
});

export async function getSong({ mood }) {
  const response = await api.get("?mood=" + mood);
  return response.data;
}

// New upload function
export async function uploadSongApi(formData) {
  const response = await api.post("/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}