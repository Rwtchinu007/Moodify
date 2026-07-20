import axios from "axios";

const api = axios.create({
  baseURL: "", 
  withCredentials: true,
});

export async function getSong({ mood }) {
  const response = await api.get("/api/songs?mood=" + mood);
  return response.data;
}

export async function uploadSongApi(formData) {
  const response = await api.post("/api/songs/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}