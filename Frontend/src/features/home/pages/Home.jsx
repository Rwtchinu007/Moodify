import React, { useState } from "react";
import FaceExpression from "../../FaceExpression/components/FaceExpression";
import Player from "../components/Player";
import UploadModal from "../components/UploadModal"; // Import the new modal
import { useSong } from "../hooks/useSong";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNavigate } from "react-router";
import "./home.scss";

const MOOD_COLORS = {
  happy: "#1ed760",
  sad: "#4a90d9",
  angry: "#e5484d",
  surprised: "#f5c518",
  fearful: "#b983f5",
  disgusted: "#7dbe3f",
  neutral: "#8a8a8e",
};

const Home = () => {
  const { handleGetSong, song } = useSong();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  const accent = MOOD_COLORS[song?.mood?.toLowerCase()] || "#1ed760";

  return (
    <main
      className={`home-container ${isPlaying ? "is-playing" : ""}`}
      style={{ "--accent": accent }}
    >
      <div className="home-glow" aria-hidden="true">
        <span className="home-glow__orb home-glow__orb--a" />
        <span className="home-glow__orb home-glow__orb--b" />
        <span className="home-glow__orb home-glow__orb--c" />
      </div>
      
      {/* New Upload Music Button/Modal on the top-left */}
      <UploadModal />

      {/* Existing Logout Button on the top-right */}
      <button className="logout-btn" onClick={onLogout}>
        Log out
      </button>

      <div className="home-header">
        <h1>Moodify AI</h1>
        <p>Your micro-expressions, translated into sound.</p>
      </div>

      <div className="expression-wrapper">
        <FaceExpression
          onClick={(expression) => {
            handleGetSong({ mood: expression });
          }}
        />
      </div>

      <Player onPlayStateChange={setIsPlaying} />
    </main>
  );
};

export default Home;