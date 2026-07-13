import { useEffect, useRef, useState } from "react";
import { detect, init } from "../utils/utils";

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
    setIsScanning(true);
    setExpression("Reading…");
    const detectedExpression = detect({ landmarkerRef, videoRef, setExpression });
    console.log(detectedExpression);
    onClick(detectedExpression);
    setTimeout(() => setIsScanning(false), 1200);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        padding: "22px",
        backgroundColor: "rgba(20, 20, 22, 0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        width: "90%",
        minWidth: "320px",
        maxWidth: "430px",
        margin: "0 auto",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
        }}
      >
        <span>Expression Scanner</span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: isScanning ? "#E8E6E1" : "rgba(255,255,255,0.25)",
            }}
          />
          {isScanning ? "Live" : "Idle"}
        </span>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          objectFit: "cover",
          borderRadius: "18px",
          backgroundColor: "#000000",
        }}
        playsInline
      />

      {/* Readout */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "14px 16px",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          Result
        </div>
        <div
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "#F5F4F1",
            minHeight: "1.4em",
          }}
        >
          {expression}
        </div>
      </div>

      {/* Action */}
      <button
        style={{
          width: "80%",
          background: "#E8E6E1",
          color: "#1A1A1A",
          border: "none",
          borderRadius: "14px",
          padding: "14px 20px",
          fontFamily: "inherit",
          fontWeight: 600,
          fontSize: "0.95rem",
          cursor: "pointer",
          margin: "0 auto",
        }}
        onClick={handleClick}
      >
        Detect Expression
      </button>
    </div>
  );
}