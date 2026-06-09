import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Copy, Check, Info, Sparkles, Award } from "lucide-react";

export default function Dashboard({ result, colors, image }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [animate, setAnimate] = useState(false);

  // Trigger entering animation
  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, [result]);

  if (!result || !colors) return null;

  const { score, breakdown, harmonyType, strengths, weaknesses, critiqueText } = result;

  // Calculate rating color
  const getRatingColorClass = (val) => {
    if (val < 6.0) return "var(--rating-poor)";
    if (val < 8.0) return "var(--rating-average)";
    return "var(--rating-good)";
  };

  const getStrokeColor = (val) => {
    if (val < 6.0) return "#ff5a5f"; // red
    if (val < 8.0) return "#ffb703"; // yellow
    return "#06d6a0"; // green
  };

  // SVG parameters for circle progress
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animate ? circumference - (score / 10) * circumference : circumference;

  const copyToClipboard = (hex, index) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
      {/* Top row: Image & Score Dashboard */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        {/* Left pane: Outfit Image & Rating gauge */}
        <div className="glass-panel p-6" style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", justifyContent: "center", minHeight: "380px" }}>
          <div style={{ position: "relative", width: "180px", height: "180px" }}>
            {/* SVG Ring */}
            <svg width="100%" height="100%" viewBox="0 0 140 140" className="circle-progress-svg">
              <circle
                className="circle-progress-bg"
                cx="70"
                cy="70"
                r={radius}
                strokeWidth={strokeWidth}
              />
              <circle
                className="circle-progress-bar"
                cx="70"
                cy="70"
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                stroke={getStrokeColor(score)}
                style={{
                  transition: "stroke-dashoffset 1.2s cubic-bezier(0.1, 1, 0.1, 1)"
                }}
              />
            </svg>
            
            {/* Score Text Overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: "2.5rem", fontWeight: "800", fontFamily: "var(--font-heading)", lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>
                Score / 10
              </span>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: `rgba(${score >= 8.0 ? "6, 214, 160" : score >= 6.0 ? "255, 183, 3" : "255, 90, 95"}, 0.1)`,
              borderRadius: "20px",
              border: `1px solid rgba(${score >= 8.0 ? "6, 214, 160" : score >= 6.0 ? "255, 183, 3" : "255, 90, 95"}, 0.3)`
            }}>
              <Award size={14} style={{ color: getStrokeColor(score) }} />
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: getStrokeColor(score) }}>
                {score >= 8.5 ? "Exceptional Style" : score >= 7.0 ? "Above Average" : score >= 5.5 ? "Good Potential" : "Needs Adjustments"}
              </span>
            </div>
          </div>

          {/* Individual metrics list */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
            {Object.entries(breakdown).map(([key, val]) => {
              const label = key === "harmony" ? "Color Harmony" : 
                            key === "fit" ? "Fit & Silhouette" : 
                            key === "cohesion" ? "Style Cohesion" : "Occasion Suitability";
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>{label}</span>
                    <span style={{ fontWeight: "700" }}>{val}%</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      width: animate ? `${val}%` : "0%",
                      height: "100%",
                      background: `linear-gradient(90deg, var(--secondary), ${getStrokeColor(val/10)})`,
                      borderRadius: "inherit",
                      transition: "width 1.2s cubic-bezier(0.1, 1, 0.1, 1)"
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Color Swatches & Critique Text */}
        <div className="glass-panel p-6" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "var(--primary)" }} />
              AI Fashion Feedback
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Based on visual color profile and stylistic metrics</p>
          </div>

          <div style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px solid var(--surface-border)",
            borderRadius: "var(--radius-sm)",
            padding: "16px",
            fontSize: "0.95rem",
            lineHeight: "1.6",
            color: "var(--text-primary)"
          }}>
            {critiqueText}
          </div>

          {/* Dominant Colors Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>Extracted Color Palette</h4>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>{harmonyType}</span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
              {colors.map((col, idx) => (
                <div
                  key={idx}
                  onClick={() => copyToClipboard(col.hex, idx)}
                  style={{
                    background: "rgba(0,0,0,0.15)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px",
                    cursor: "pointer",
                    transition: "var(--transition)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  className="glass-panel-hover"
                >
                  <div style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: col.hex,
                    borderRadius: "4px",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: col.isDark ? "white" : "black"
                  }}>
                    {copiedIndex === idx ? <Check size={16} /> : <Copy size={14} style={{ opacity: 0 }} className="copy-hover-icon" />}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "110px" }}>{col.name}</p>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>{col.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom row: Strengths & Weaknesses */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        {/* Strengths Card */}
        <div className="glass-panel p-6 border-good" style={{ borderLeft: "4px solid var(--rating-good)" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", fontWeight: "700", color: "#06d6a0", marginBottom: "16px" }}>
            <CheckCircle2 size={18} />
            Outfit Strengths
          </h4>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none" }}>
            {strengths.map((str, idx) => (
              <li key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <span style={{ color: "#06d6a0", fontWeight: "bold", fontSize: "1rem", marginTop: "-2px" }}>✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="glass-panel p-6 border-poor" style={{ borderLeft: "4px solid var(--rating-average)" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", fontWeight: "700", color: "#ffd700", marginBottom: "16px" }}>
            <AlertTriangle size={18} />
            Areas for Improvement
          </h4>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none" }}>
            {weaknesses.map((weak, idx) => (
              <li key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <span style={{ color: "#ffd700", fontWeight: "bold", fontSize: "1rem", marginTop: "-2px" }}>⚠</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <style>{`
        .glass-panel-hover:hover .copy-hover-icon {
          opacity: 0.6 !important;
        }
        .border-good {
          transition: var(--transition);
        }
        .border-good:hover {
          border-color: rgba(6, 214, 160, 0.4) !important;
        }
        .border-poor:hover {
          border-color: rgba(255, 183, 3, 0.4) !important;
        }
      `}</style>
    </div>
  );
}
