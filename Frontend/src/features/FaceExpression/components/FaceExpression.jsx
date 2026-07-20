import { useEffect, useRef, useState } from "react";
import { detect, init } from "../utils/utils";
import "./face-expression.scss";

export default function FaceExpression({ onClick = () => {} }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const [expression, setExpression] = useState("Standby");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    init({ landmarkerRef, videoRef, streamRef });

    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

async function handleClick() {
    if (isScanning) return; 
    setIsScanning(true);
    setExpression("Analyzing...");
    
    // 1. Attempt detection
    const detectedExpression = detect({ landmarkerRef, videoRef, setExpression });
    
    // 2. CRITICAL FIX: Stop loop if no face is found
    if (!detectedExpression) {
        setExpression("No face detected");
        setTimeout(() => {
            setExpression("Standby");
            setIsScanning(false);
        }, 1500);
        return; 
    }

    onClick(detectedExpression);
    setTimeout(() => setIsScanning(false), 1200);
  }

  return (
    <div className={`premium-scanner ${isScanning ? 'is-scanning' : ''}`}>
      {/* Header */}
      <div className="scanner-header">
        <span className="scanner-title">Live Capture</span>
        <div className="status-badge">
          <span className={`status-dot ${isScanning ? 'live' : 'idle'}`} />
          <span className="status-text">{isScanning ? "Processing" : "Ready"}</span>
        </div>
      </div>

      {/* Video Feed with Soft Glowing Accents */}
      <div className="video-container">
        <video 
          ref={videoRef} 
          className="camera-feed" 
          playsInline 
          autoPlay 
          muted 
        />
        {/* Soft, minimalist corners instead of harsh brackets */}
        <div className="frame-corner top-left"></div>
        <div className="frame-corner top-right"></div>
        <div className="frame-corner bottom-left"></div>
        <div className="frame-corner bottom-right"></div>
        
        {/* Elegant sweeping light effect */}
        {isScanning && <div className="soft-scan-overlay" />}
      </div>

      {/* Dynamic Data Readout */}
      <div className="result-display">
        <span className="result-label">Detected Signature</span>
        <div className="result-value-wrapper">
          <h3 key={expression} className="result-value">
            {expression}
          </h3>
        </div>
      </div>

      {/* Premium Pill Button */}
      <button 
        className="scan-btn" 
        onClick={handleClick}
        disabled={isScanning}
      >
        {isScanning ? "Reading Expressions..." : "Detect Mood"}
      </button>
    </div>
  );
}