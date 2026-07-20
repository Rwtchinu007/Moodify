import React, { useState } from "react";
import FaceExpression from "../../FaceExpression/components/FaceExpression";
import Player from "../components/Player";
import UploadModal from "../components/UploadModal";
import { useSong } from "../hooks/useSong";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNavigate } from "react-router";
import "./home.scss";

// High-Resolution Apple iOS Emojis
const MOOD_DATA = {
  happy: {
    color: "#1ed760",
    emoji:
      "https://em-content.zobj.net/source/apple/391/grinning-face-with-smiling-eyes_1f604.png",
    label: "Happy",
  },
  sad: {
    color: "#4a90d9",
    emoji: "https://em-content.zobj.net/source/apple/391/crying-face_1f622.png",
    label: "Sad",
  },
  surprised: {
    color: "#f5c518",
    emoji:
      "https://em-content.zobj.net/source/apple/391/face-with-open-mouth_1f62e.png",
    label: "Surprised",
  },
  neutral: {
    color: "#8a8a8e",
    emoji:
      "https://em-content.zobj.net/source/apple/391/neutral-face_1f610.png",
    label: "Neutral",
  },
};

const Home = () => {
  const { handleGetSong, song, setSong, songs } = useSong();
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMood, setCurrentMood] = useState("neutral");
  const [matchPercentage, setMatchPercentage] = useState(88);

  const [moodHistory, setMoodHistory] = useState([
    {
      mood: "neutral",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  const handleMoodDetected = (expression) => {
    const rawMood = expression.toLowerCase();
    const validMood = MOOD_DATA[rawMood] ? rawMood : "neutral";

    setCurrentMood(validMood);
    handleGetSong({ mood: validMood });

    const randomPercent = Math.floor(Math.random() * (95 - 80 + 1)) + 80;
    setMatchPercentage(randomPercent);

    setMoodHistory((prev) =>
      [
        {
          mood: validMood,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ].slice(0, 8),
    );
  };

  const activeData = MOOD_DATA[currentMood];

  return (
    <main
      className="dashboard-layout"
      style={{ "--theme-color": activeData.color }}
    >
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="brand-logo"
          >
            <rect
              x="3"
              y="9"
              width="4"
              height="6"
              rx="2"
              fill="currentColor"
              className="wave-bar bar-1"
            />
            <rect
              x="10"
              y="4"
              width="4"
              height="16"
              rx="2"
              fill="currentColor"
              className="wave-bar bar-2"
            />
            <rect
              x="17"
              y="7"
              width="4"
              height="10"
              rx="2"
              fill="currentColor"
              className="wave-bar bar-3"
            />
          </svg>
          <h1 className="brand-text">Moodify</h1>
        </div>

        <div className="nav-actions">
          <UploadModal />
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user?.username || "User"}</span>
              <button className="logout-text" onClick={onLogout}>
                logout
              </button>
            </div>
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-grid">
        <section className="grid-col left-col">
          <div className="panel capture-panel">
            <FaceExpression onClick={handleMoodDetected} />
          </div>
        </section>

        <section className="grid-col middle-col">
          <div className="panel analysis-panel">
            <div className="analysis-header">Current Mood Analysis</div>
            <div className="analysis-body">
              <div className="mood-text-wrapper">
                <h2 className="mood-title" key={currentMood}>
                  {activeData.label}
                </h2>
                <div className="match-bar-container">
                  <div
                    className="match-bar-fill"
                    style={{
                      width: `${matchPercentage}%`,
                      backgroundColor: activeData.color,
                    }}
                  ></div>
                </div>
                <span className="match-text">{matchPercentage}% match</span>
              </div>
              <div className="mood-emoji-large" key={activeData.emoji}>
                <img src={activeData.emoji} alt={activeData.label} />
              </div>
            </div>
          </div>

          <div className="panel history-panel">
            <div className="history-header">
              <span>Mood History</span>
              <span className="live-indicator">
                <span className="dot"></span> LIVE
              </span>
            </div>

            <div className="history-tabs">
              <button className="tab active" style={{ width: "100%" }}>
                Today's Timeline
              </button>
            </div>

            <div className="timeline-list">
              {moodHistory.map((item, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-left">
                    <span
                      className="timeline-dot"
                      style={{ backgroundColor: MOOD_DATA[item.mood].color }}
                    ></span>
                    <img
                      src={MOOD_DATA[item.mood].emoji}
                      alt={item.mood}
                      className="timeline-emoji-img"
                    />
                    <span className="timeline-mood">
                      {MOOD_DATA[item.mood].label}
                    </span>
                  </div>
                  <span className="timeline-time">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid-col right-col">
          <div className="playlist-panel">
            <div className="playlist-header">
              <span className="sparkle">✦</span> AI Recommended Playlist for you
            </div>

            <div className="playlist-tracks">
              {songs && songs.length > 0 ? (
                songs.map((track, index) => (
                  <div
                    className={`track-item ${song?._id === track._id ? "active" : ""}`}
                    key={track._id || index}
                    onClick={() => setSong(track)}
                  >
                    <span className="track-num">{index + 1}</span>
                    <img
                      src={track.posterUrl}
                      alt="cover"
                      className="track-cover"
                    />
                    <div className="track-info">
                      <span className="track-title">{track.title}</span>
                      <span className="track-artist">Mood: {track.mood}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  Detect a mood to generate your playlist
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <Player onPlayStateChange={setIsPlaying} />
    </main>
  )
};

export default Home;
