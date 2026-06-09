import React, { useState, useRef } from "react";
import { UploadCloud, Shirt, Sparkles, MessageSquare, Loader, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export default function UploadSection({ onAnalysisComplete }) {
  const [image, setImage] = useState(null);
  const [occasion, setOccasion] = useState("casual");
  const [vibe, setVibe] = useState("minimalist");
  const [notes, setNotes] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  const fileInputRef = useRef(null);

  const loadingPhrases = [
    "Reading fabric textures and shapes...",
    "Scanning RGB color spectrum channels...",
    "Correlating layout with fashion rules...",
    "Generating style ratings and suggestions..."
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    setLoadingStep(0);

    // Simulate multi-stage AI analysis loading
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingPhrases.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            onAnalysisComplete({ image, occasion, vibe, notes });
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
  };

  const clearImage = () => {
    setImage(null);
    setNotes("");
  };

  return (
    <section className="glass-panel glow-border p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justify: "center",
          color: "white"
        }}>
          <Shirt size={22} style={{ margin: "auto" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Outfit Upload</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Upload your photo and specify the outfit details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={!image ? triggerFileSelect : undefined}
          style={{
            border: `2px dashed ${dragActive ? "var(--primary)" : "var(--surface-border-hover)"}`,
            borderRadius: "var(--radius-md)",
            height: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: image ? "default" : "pointer",
            background: dragActive ? "rgba(157, 78, 221, 0.05)" : "rgba(0, 0, 0, 0.15)",
            position: "relative",
            overflow: "hidden",
            transition: "var(--transition)"
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />

          {image ? (
            <>
              <img
                src={image}
                alt="Outfit Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "inherit"
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(0, 0, 0, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  backdropFilter: "blur(4px)"
                }}
              >
                Change Photo
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <UploadCloud size={48} style={{ color: "var(--primary)", opacity: 0.8 }} />
              <div>
                <p style={{ fontWeight: "600", color: "var(--text-primary)" }}>Drag and drop your outfit photo</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>or click to browse local files</p>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Supports PNG, JPG, or WEBP formats</p>
            </div>
          )}
        </div>

        {/* Inputs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <Sparkles size={14} style={{ marginRight: "6px", verticalAlign: "middle", color: "var(--primary)" }} />
              Occasion Suitability
            </label>
            <select
              className="input-field"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="casual">Casual Hangout</option>
              <option value="formal">Black Tie Formal</option>
              <option value="business">Business Casual</option>
              <option value="date">Date Night</option>
              <option value="streetwear">Streetwear & Hype</option>
              <option value="party">Festive Night Out</option>
              <option value="activewear">Gym & Athletics</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <Shirt size={14} style={{ marginRight: "6px", verticalAlign: "middle", color: "var(--accent)" }} />
              Style Vibe
            </label>
            <select
              className="input-field"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="minimalist">Minimalist</option>
              <option value="bold">Bold & Colorful</option>
              <option value="elegant">Elegant</option>
              <option value="cozy">Cozy / Casual Cozy</option>
              <option value="edge">Edge & Grunge</option>
            </select>
          </div>
        </div>

        {/* Notes input */}
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <MessageSquare size={14} style={{ marginRight: "6px", verticalAlign: "middle", color: "var(--secondary)" }} />
            Styling Notes (Optional)
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="E.g., Wearing oversized tailoring; weather is sunny; does the scarf fit?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: "100%", resize: "none" }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary"
          disabled={!image}
          style={{ width: "100%", padding: "14px 28px", fontSize: "1.05rem" }}
        >
          <Sparkles size={18} />
          Analyze Style Profile
        </button>
      </form>

      {/* Simulated AI scanning loader */}
      {loading && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(7, 6, 17, 0.85)",
          backdropFilter: "blur(10px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div className="glass-panel glow-border p-8 text-center" style={{ width: "90%", maxWidth: "400px", padding: "40px" }}>
            <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 24px auto" }}>
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "4px solid rgba(157, 78, 221, 0.1)",
                borderTopColor: "var(--primary)",
                animation: "spin 1s linear infinite"
              }}></div>
              <div style={{
                position: "absolute",
                inset: "8px",
                borderRadius: "50%",
                border: "4px solid rgba(247, 37, 133, 0.1)",
                borderBottomColor: "var(--accent)",
                animation: "spin 1.5s linear infinite reverse"
              }}></div>
              <Shirt size={28} style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "var(--text-primary)",
                animation: "pulse 2s infinite"
              }} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "12px" }}>StyleVibe AI Scanning</h3>
            
            {/* Step messages */}
            <div style={{ minHeight: "44px" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }} className="animate-fade-in" key={loadingStep}>
                {loadingPhrases[loadingStep]}
              </p>
            </div>

            {/* Micro progress indicators */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
              {loadingPhrases.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: idx <= loadingStep ? "var(--primary)" : "rgba(255,255,255,0.1)",
                    transition: "var(--transition)",
                    boxShadow: idx <= loadingStep ? "0 0 8px var(--primary)" : "none"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Inline styles for keyframe spinning, since index.css spin can be defined simply */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
