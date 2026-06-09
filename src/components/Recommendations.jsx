import React, { useState, useEffect } from "react";
import { Footprints, Watch, Palette, TrendingUp, Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { getClosestFashionColor } from "../utils/fashionAnalyzer";

export default function Recommendations({ result, colors, occasion, vibe, onUpdateResult }) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("tips"); // "tips" or "sandbox"
  
  // Sandbox states
  const [swappedPalette, setSwappedPalette] = useState([]);
  const [sandboxScore, setSandboxScore] = useState(null);
  const [sandboxExplanation, setSandboxExplanation] = useState("");

  const { suggestions } = result;

  // Reset sandbox when input colors change
  useEffect(() => {
    setSwappedPalette([...colors]);
    setSandboxScore(result.score);
    setSandboxExplanation("Select an outfit color above, then pick a swap candidate below to simulate styling improvements.");
    setSelectedColorIndex(0);
  }, [colors, result]);

  const swapCandidates = [
    { hex: "#0a0a0a", name: "Charcoal Black", r: 10, g: 10, b: 10, isDark: true, type: "neutral" },
    { hex: "#faf9f6", name: "Alabaster White", r: 250, g: 249, b: 246, isDark: false, type: "neutral" },
    { hex: "#d2b48c", name: "Desert Tan", r: 210, g: 180, b: 140, isDark: false, type: "neutral" },
    { hex: "#0b3c5d", name: "Midnight Navy", r: 11, g: 60, b: 93, isDark: true, type: "cool" },
    { hex: "#800020", name: "Deep Burgundy", r: 128, g: 0, b: 32, isDark: true, type: "warm" },
    { hex: "#556b2f", name: "Olive Green", r: 85, g: 107, b: 47, isDark: true, type: "cool" },
    { hex: "#ffd700", name: "Mustard Gold", r: 255, g: 215, b: 0, isDark: false, type: "warm" }
  ];

  const handleSwap = (candidate) => {
    if (selectedColorIndex === null) return;
    
    const newPalette = [...swappedPalette];
    const oldColor = newPalette[selectedColorIndex];
    newPalette[selectedColorIndex] = candidate;
    setSwappedPalette(newPalette);

    // Calculate simulated rating impact
    let scoreDiff = 0;
    let comment = "";

    const replacedType = oldColor.type;
    const targetType = candidate.type;

    if (occasion === "formal" && replacedType === "bright" && targetType === "neutral") {
      scoreDiff = 1.2;
      comment = `Swapping electric colors for ${candidate.name} anchors the silhouette, aligning perfectly with a premium formal dress code.`;
    } else if (occasion === "business" && replacedType === "bright" && targetType === "neutral") {
      scoreDiff = 0.9;
      comment = `Professional environments favor neutral anchors. Replacing bright tones with ${candidate.name} optimizes suitability.`;
    } else if (vibe === "minimalist" && targetType === "neutral") {
      scoreDiff = 0.6;
      comment = `Minimalist vibes rely on low-saturated tones. Introducing ${candidate.name} cleans up visual clutter.`;
    } else if (vibe === "bold" && oldColor.type === "neutral" && candidate.type !== "neutral") {
      scoreDiff = 0.8;
      comment = `Excellent bold choice! Swapping a muted tone for ${candidate.name} creates the vibrant pop required for this vibe.`;
    } else if (occasion === "date" && candidate.name === "Deep Burgundy") {
      scoreDiff = 0.5;
      comment = "Deep Burgundy invokes a romantic, warm warmth, adding key date-night cohesion.";
    } else if (candidate.hex === oldColor.hex) {
      scoreDiff = 0.0;
      comment = "No changes applied. Select a different candidate to test alternative color options.";
    } else {
      // General neutral enhancement
      if (candidate.type === "neutral" && oldColor.type !== "neutral") {
        scoreDiff = 0.3;
        comment = `Replacing accents with ${candidate.name} stabilizes the color palette, enhancing versatility.`;
      } else {
        scoreDiff = 0.2;
        comment = `Testing ${candidate.name} coordinates a new contrast balance. Feel free to experiment with accessories matching this tone.`;
      }
    }

    const nextScore = parseFloat(Math.min(10.0, Math.max(1.0, result.score + scoreDiff)).toFixed(1));
    setSandboxScore(nextScore);
    setSandboxExplanation(comment);
  };

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case "footwear swap":
        return <Footprints size={18} style={{ color: "var(--primary)" }} />;
      case "accessories":
        return <Watch size={18} style={{ color: "var(--accent)" }} />;
      case "alternative colors":
        return <Palette size={18} style={{ color: "var(--secondary)" }} />;
      default:
        return <TrendingUp size={18} style={{ color: "var(--rating-good)" }} />;
    }
  };

  const resetSandbox = () => {
    setSwappedPalette([...colors]);
    setSandboxScore(result.score);
    setSandboxExplanation("Sandbox reset. Select an outfit color to swap.");
  };

  return (
    <section className="glass-panel p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      {/* Tabs Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--surface-border)", paddingBottom: "12px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={20} style={{ color: "var(--accent)" }} />
          Style Enhancement Suite
        </h3>
        
        <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.2)", borderRadius: "20px", padding: "3px" }}>
          <button
            onClick={() => setActiveTab("tips")}
            style={{
              background: activeTab === "tips" ? "var(--primary)" : "transparent",
              border: "none",
              color: activeTab === "tips" ? "white" : "var(--text-secondary)",
              padding: "6px 16px",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "600",
              transition: "var(--transition)"
            }}
          >
            Enhancement Tips
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            style={{
              background: activeTab === "sandbox" ? "var(--primary)" : "transparent",
              border: "none",
              color: activeTab === "sandbox" ? "white" : "var(--text-secondary)",
              padding: "6px 16px",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "600",
              transition: "var(--transition)"
            }}
          >
            Style Sandbox
          </button>
        </div>
      </div>

      {activeTab === "tips" ? (
        /* Tab 1: AI Suggestions list */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 glass-panel-hover"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "rgba(0,0,0,0.15)",
                border: "1px solid var(--surface-border)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {getCategoryIcon(sug.category)}
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>{sug.category}</h4>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {sug.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Tab 2: Interactive Sandbox color swapper */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Select one of your outfit's colors, then click on a recommended replacement candidate to simulate how it impacts your styling score.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            
            {/* Sandbox Workspace panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>Step 1: Select Color to Swap</h4>
                <button
                  onClick={resetSandbox}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--primary)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: "600"
                  }}
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Swappable active colors */}
              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                {swappedPalette.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColorIndex(idx)}
                    style={{
                      flex: 1,
                      height: "60px",
                      backgroundColor: col.hex,
                      border: selectedColorIndex === idx ? "3px solid var(--accent)" : "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      boxShadow: selectedColorIndex === idx ? "0 0 15px var(--accent-glow)" : "none",
                      transition: "var(--transition)",
                      position: "relative"
                    }}
                    title={col.name}
                  >
                    {selectedColorIndex === idx && (
                      <div style={{
                        position: "absolute",
                        bottom: "-20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent)"
                      }} />
                    )}
                  </button>
                ))}
              </div>

              {/* Step 2: Swap options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>Step 2: Choose Recommended Swap</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {swapCandidates.map((candidate, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSwap(candidate)}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--surface-border)",
                        borderRadius: "20px",
                        padding: "6px 12px",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        transition: "var(--transition)"
                      }}
                      className="glass-panel-hover"
                    >
                      <div style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: candidate.hex,
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
                      }} />
                      {candidate.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sandbox Result Output */}
            <div className="glass-panel p-5" style={{ background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px", minHeight: "180px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>Simulated Score:</span>
                
                {/* Score change diff pill */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {sandboxScore !== result.score && (
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      backgroundColor: sandboxScore > result.score ? "rgba(6, 214, 160, 0.15)" : "rgba(255, 90, 95, 0.15)",
                      color: sandboxScore > result.score ? "var(--rating-good)" : "var(--rating-poor)",
                      border: `1px solid ${sandboxScore > result.score ? "rgba(6, 214, 160, 0.3)" : "rgba(255, 90, 95, 0.3)"}`
                    }}>
                      {sandboxScore > result.score ? `+${(sandboxScore - result.score).toFixed(1)}` : (sandboxScore - result.score).toFixed(1)}
                    </span>
                  )}
                  <span style={{
                    fontSize: "2rem",
                    fontWeight: "800",
                    fontFamily: "var(--font-heading)",
                    color: sandboxScore > result.score ? "var(--rating-good)" : sandboxScore === result.score ? "var(--text-primary)" : "var(--rating-poor)"
                  }}>
                    {sandboxScore}/10
                  </span>
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.2)",
                borderRadius: "var(--radius-sm)",
                padding: "12px",
                fontSize: "0.85rem",
                lineHeight: "1.5",
                color: "var(--text-secondary)",
                borderLeft: "3px solid var(--primary)",
                minHeight: "70px",
                display: "flex",
                alignItems: "center"
              }}>
                {sandboxExplanation}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
