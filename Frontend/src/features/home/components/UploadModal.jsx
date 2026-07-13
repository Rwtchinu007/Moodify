import React, { useState } from "react";
import { uploadSongApi } from "../services/song.api";
import "./upload-modal.scss";

const UploadModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [mood, setMood] = useState("happy");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select an audio file.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("song", file); // Must match backend multer config
    formData.append("mood", mood);

    try {
      await uploadSongApi(formData);
      setMessage("Song uploaded successfully!");
      setFile(null);
      setTimeout(() => {
        setIsOpen(false);
        setMessage("");
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading song");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="upload-trigger-btn" onClick={() => setIsOpen(true)}>
        Upload Music
      </button>

      {isOpen && (
        <div className="upload-modal-overlay">
          <div className="upload-modal-card">
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              &times;
            </button>
            
            <h2>Upload a Song</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Audio File (MP3)</label>
                <input
                  type="file"
                  accept="audio/mpeg, audio/mp3"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Mood</label>
                <select value={mood} onChange={(e) => setMood(e.target.value)}>
                  {/* These match the enum in your song.model.js */}
                  <option value="happy">Happy</option>
                  <option value="sad">Sad</option>
                  <option value="surprised">Surprised</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="upload-submit-btn" 
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Song"}
              </button>

              {message && (
                <p className={`upload-message ${message.includes("success") ? "success" : "error"}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadModal;