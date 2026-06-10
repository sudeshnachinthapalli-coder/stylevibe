import React, { useState, useEffect } from "react";
import { Sparkles, Sun, Moon, ArrowLeft, PlusCircle, Shirt, Coffee } from "lucide-react";
import UploadSection from "./components/UploadSection";
import Dashboard from "./components/Dashboard";
import Recommendations from "./components/Recommendations";
import OutfitHistory from "./components/OutfitHistory";
import { extractDominantColors, analyzeOutfit } from "./utils/fashionAnalyzer";
import { supabase, uploadOutfitImage } from "./utils/supabaseClient";
const THEMES = [
  { id: "dark", label: "Dark Cyber", primaryColor: "#9d4edd", bgColor: "#070611" },
  { id: "light", label: "Classic Frost", primaryColor: "#7209b7", bgColor: "#f6f7fb" },
  { id: "latte", label: "Warm Latte", primaryColor: "#8b5a2b", bgColor: "#f4efe6" },
  { id: "sage", label: "Mint Sage", primaryColor: "#3e5c43", bgColor: "#f1f4f0" },
  { id: "rose", label: "Blush Sakura", primaryColor: "#b85b75", bgColor: "#faf5f6" }
];

export default function App() {
  const [activeOutfit, setActiveOutfit] = useState(null);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState("dark");

  // Initialize: Load history from localStorage/Supabase and set theme
  useEffect(() => {
    async function loadHistory() {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("outfits")
            .select("*")
            .order("created_at", { ascending: false });
          
          if (error) throw error;
          
          if (data) {
            const mapped = data.map(item => ({
              id: item.id,
              image: item.image_url,
              occasion: item.occasion,
              vibe: item.vibe,
              notes: item.notes,
              colors: item.result_json.colors || [],
              result: item.result_json,
              createdAt: item.created_at
            }));
            setHistory(mapped);
          }
        } catch (err) {
          console.error("Failed to load history from Supabase, falling back to local storage:", err);
          loadLocalHistory();
        }
      } else {
        loadLocalHistory();
      }
    }

    function loadLocalHistory() {
      const savedHistory = localStorage.getItem("stylevibe_history");
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse local history", e);
        }
      }
    }

    loadHistory();

    const savedTheme = localStorage.getItem("stylevibe_theme");
    if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Update theme on body
  useEffect(() => {
    document.body.classList.remove("light-mode", "latte-mode", "sage-mode", "rose-mode");
    if (theme !== "dark") {
      document.body.classList.add(`${theme}-mode`);
    }
    localStorage.setItem("stylevibe_theme", theme);
  }, [theme]);

  // Run Outfit Rating
  const handleAnalysisComplete = ({ image, occasion, vibe, notes }) => {
    extractDominantColors(image, async (colors) => {
      const result = analyzeOutfit({ colors, occasion, vibe, notes });
      
      let finalImageUrl = image;
      let dbId = Date.now().toString();

      if (supabase) {
        try {
          // Upload base64 image to Supabase Storage bucket "outfits"
          const publicUrl = await uploadOutfitImage(image, `outfit_${dbId}.jpg`);
          finalImageUrl = publicUrl;
          
          // Save rating record in Supabase Table "outfits"
          const { data, error } = await supabase
            .from("outfits")
            .insert([
              {
                image_url: finalImageUrl,
                occasion,
                vibe,
                notes,
                score: result.score,
                result_json: { ...result, colors }
              }
            ])
            .select();
            
          if (error) throw error;
          if (data && data[0]) {
            dbId = data[0].id;
          }
        } catch (err) {
          console.error("Supabase sync failed, saving locally instead:", err);
        }
      }

      const newOutfit = {
        id: dbId,
        image: finalImageUrl,
        occasion,
        vibe,
        notes,
        colors,
        result,
        createdAt: new Date().toISOString()
      };

      // Update active outfit
      setActiveOutfit(newOutfit);

      // Save to local copy and update state
      const updatedHistory = [newOutfit, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("stylevibe_history", JSON.stringify(updatedHistory));
    });
  };

  const handleSelectHistory = (item) => {
    setActiveOutfit(item);
  };

  const handleDeleteHistory = async (id) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("outfits")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete from Supabase:", err);
      }
    }

    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("stylevibe_history", JSON.stringify(updatedHistory));
    
    if (activeOutfit && activeOutfit.id === id) {
      setActiveOutfit(null);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all outfit history?")) {
      if (supabase) {
        try {
          const { error } = await supabase
            .from("outfits")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all rows
          if (error) throw error;
        } catch (err) {
          console.error("Failed to clear from Supabase:", err);
        }
      }

      setHistory([]);
      localStorage.removeItem("stylevibe_history");
      setActiveOutfit(null);
    }
  };

  const handleGoBack = () => {
    setActiveOutfit(null);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <header
        className="glass-panel"
        style={{
          borderRadius: "0 0 var(--radius-md) var(--radius-md)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderWidth: "0 0 1px 0",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(20px)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={handleGoBack}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            borderRadius: "8px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "800", background: "linear-gradient(90deg, #fff, var(--text-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              StyleVibe AI
            </h1>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "500" }}>Smart Fashion Advisor</p>
          </div>
        </div>

        {/* Action controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {activeOutfit && (
            <button
              onClick={handleGoBack}
              className="btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.85rem", gap: "6px" }}
            >
              <PlusCircle size={15} />
              <span>Rate New Outfit</span>
            </button>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "20px", border: "1px solid var(--surface-border)" }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  backgroundColor: t.bgColor,
                  border: theme === t.id ? "2px solid var(--primary)" : "1px solid var(--surface-border-hover)",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "var(--transition)",
                  padding: 0,
                  position: "relative",
                  boxShadow: theme === t.id ? "0 0 8px var(--primary-glow)" : "none"
                }}
                title={t.label}
              >
                <div style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: t.primaryColor
                }} />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main body layout grid */}
      <div className="layout-container" style={{ flex: 1 }}>
        {/* Sidebar Panel */}
        <div style={{ padding: "24px 0 24px 24px" }} className="history-sidebar-container">
          <OutfitHistory
            history={history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
            activeId={activeOutfit?.id}
          />
        </div>

        {/* Workspace panel */}
        <main className="main-content">
          {!activeOutfit ? (
            /* Upload Screen */
            <div style={{ maxWidth: "680px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ textAlign: "center", marginTop: "1rem", marginBottom: "1rem" }} className="animate-fade-in">
                <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "8px" }}>Is your outfit a perfect fit?</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "440px", margin: "0 auto" }}>
                  Get an instant, professional AI fashion critique on color contrast, suitability, and suggestions to elevate your style.
                </p>
              </div>
              <UploadSection onAnalysisComplete={handleAnalysisComplete} />
            </div>
          ) : (
            /* Results Screen */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={handleGoBack}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    transition: "var(--transition)"
                  }}
                  className="hover-back-btn"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Upload</span>
                </button>
              </div>

              {/* Layout splits into Visual display on left and dashboard feedback on right */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }} className="results-grid">
                
                {/* Visual Image View Card */}
                <div className="glass-panel p-5" style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "100px" }}>
                  <div style={{ position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden", aspectRatio: "4/5", background: "rgba(0,0,0,0.15)" }}>
                    <img src={activeOutfit.image} alt="Outfit Rated" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <span>Occasion:</span>
                      <strong style={{ color: "var(--text-primary)" }}>
                        {activeOutfit.occasion.charAt(0).toUpperCase() + activeOutfit.occasion.slice(1)}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <span>Vibe Preset:</span>
                      <strong style={{ color: "var(--text-primary)" }}>
                        {activeOutfit.vibe.charAt(0).toUpperCase() + activeOutfit.vibe.slice(1)}
                      </strong>
                    </div>
                    {activeOutfit.notes && (
                      <div style={{ marginTop: "6px", paddingTop: "8px", borderTop: "1px solid var(--surface-border)" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>User Notes:</span>
                        <p style={{ fontSize: "0.75rem", fontStyle: "italic", color: "var(--text-secondary)" }}>"{activeOutfit.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score meters, analysis, strengths, weaknesses & suggestions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <Dashboard result={activeOutfit.result} colors={activeOutfit.colors} image={activeOutfit.image} />
                  <Recommendations
                    result={activeOutfit.result}
                    colors={activeOutfit.colors}
                    occasion={activeOutfit.occasion}
                    vibe={activeOutfit.vibe}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .hover-back-btn:hover {
          color: var(--primary) !important;
        }
        @media (max-width: 1024px) {
          .history-sidebar-container {
            padding: 24px !important;
            border-bottom: 1px solid var(--surface-border);
          }
        }
        @media (max-width: 768px) {
          .results-grid {
            grid-template-columns: 1fr !important;
          }
          .results-grid > div:first-child {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
