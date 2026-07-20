import React, { useRef, useState, useEffect } from "react";
import { useSong } from "../hooks/useSong";
import "./player.scss";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const Player = ({ onPlayStateChange = () => {} }) => {
  const { song } = useSong();
  const audioRef = useRef(null);
  const activeProgressRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // FIX: State to track dragging
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let playTimeout;
    if (audioRef.current && song?.url) {
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);

      playTimeout = setTimeout(async () => {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Browser blocked autoplay:", error);
          setIsPlaying(false);
        }
      }, 800);
    }
    return () => clearTimeout(playTimeout);
  }, [song?.url]);

  useEffect(() => {
    onPlayStateChange(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const skip = (secs) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(
      Math.max(audio.currentTime + secs, 0),
      duration,
    );
  };

  // FIX: Only update time automatically if the user is NOT dragging the bar
  const handleTimeUpdate = () => {
    if (!isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => setDuration(audioRef.current.duration);

  // FIX: Unified dragging logic for both Mouse and Touch
  const updateProgressFromEvent = (clientX, progressElement) => {
    if (!progressElement || !duration) return;
    const rect = progressElement.getBoundingClientRect();
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio)); // Keep between 0 and 1

    const newTime = ratio * duration;
    setCurrentTime(newTime);
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    activeProgressRef.current = e.currentTarget;
    updateProgressFromEvent(e.clientX || e.touches[0].clientX, e.currentTarget);
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDragging) {
        updateProgressFromEvent(
          e.clientX || e.touches[0].clientX,
          activeProgressRef.current,
        );
      }
    };
    const handlePointerUp = () => {
      activeProgressRef.current = null;
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchmove", handlePointerMove);
      window.addEventListener("touchend", handlePointerUp);
    }

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, duration]);

  // ... Keep volume and speed handlers unchanged ...
  const handleSpeedChange = (s) => {
    setSpeed(s);
    audioRef.current.playbackRate = s;
    setShowSpeed(false);
  };
  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioRef.current.volume = val;
    setIsMuted(val === 0);
  };
  const toggleMute = () => {
    const audio = audioRef.current;
    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };
  const handleSongEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const volumeLevel = isMuted ? 0 : volume;

  if (!song) return null;

  return (
    <div className={`glass-capsule-player ${isPlaying ? "is-playing" : ""}`}>
      <audio
        ref={audioRef}
        src={song.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnd}
      />

      <div
        className="mobile-progress"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div
          className="mobile-progress-fill"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--theme-color)",
          }}
        />
      </div>

      <div className="player-section left">
        <div className="poster-container">
          <img className="poster-image" src={song.posterUrl} alt={song.title} />
        </div>
        <div className="track-details">
          <h4 className="track-name">{song.title}</h4>
          <div className="track-status">
            <span
              className="mood-badge"
              style={{ color: "var(--theme-color)" }}
            >
              {song.mood}
            </span>
            {isPlaying && (
              <div className="visualizer">
                <span style={{ backgroundColor: "var(--theme-color)" }}></span>
                <span style={{ backgroundColor: "var(--theme-color)" }}></span>
                <span style={{ backgroundColor: "var(--theme-color)" }}></span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="player-section center">
        <div className="playback-controls">
          <button className="icon-btn" onClick={() => skip(-5)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="20"
              height="20"
            >
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            </svg>
          </button>

          <button
            className="play-pause-btn"
            onClick={togglePlay}
            style={{ color: isPlaying ? "#000" : "#fff" }}
          >
            <div
              className="btn-backdrop"
              style={{
                backgroundColor: isPlaying
                  ? "var(--theme-color)"
                  : "rgba(255,255,255,0.1)",
              }}
            ></div>
            {isPlaying ? (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
                style={{ position: "relative", zIndex: 2 }}
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
                style={{ position: "relative", zIndex: 2, marginLeft: "2px" }}
              >
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </button>

          <button className="icon-btn" onClick={() => skip(5)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="20"
              height="20"
            >
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            </svg>
          </button>
        </div>

        <div className="scrubber-container">
          <span className="time">{formatTime(currentTime)}</span>
          {/* FIX: Bind dragging events to the scrubber track */}
          <div
            className="scrubber-track"
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          >
            <div
              className="scrubber-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--theme-color)",
              }}
            >
              <div className="scrubber-thumb"></div>
            </div>
          </div>
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-section right">
        <div className="speed-wrap">
          <button className="text-btn" onClick={() => setShowSpeed(!showSpeed)}>
            {speed}x
          </button>
          {showSpeed && (
            <div className="speed-dropdown">
              {SPEED_OPTIONS.map((s) => (
                <button
                  key={s}
                  className={s === speed ? "active" : ""}
                  onClick={() => handleSpeedChange(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="vol-wrap">
          <button className="icon-btn" onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.87 8.87 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volumeLevel}
            onChange={handleVolume}
            className="vol-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
