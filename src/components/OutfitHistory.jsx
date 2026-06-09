import React from "react";
import { History, Trash2, Calendar, Award, Trash } from "lucide-react";

export default function OutfitHistory({ history, onSelect, onDelete, onClear, activeId }) {
  
  const getScoreColor = (score) => {
    if (score < 6.0) return "var(--rating-poor)";
    if (score < 8.0) return "var(--rating-average)";
    return "var(--rating-good)";
  };

  const formatOccasion = (occ) => {
    return occ.charAt(0).toUpperCase() + occ.slice(1);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <aside className="glass-panel p-5" style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
      {/* Sidebar Header */}
      <div style={{ display: "flex", alignItems: "center", justify: "space-between", borderBottom: "1px solid var(--surface-border)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <History size={18} style={{ color: "var(--primary)" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Style Log</h3>
        </div>
        {history.length > 0 && (
          <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
            {history.length}
          </span>
        )}
      </div>

      {/* History List */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "calc(100vh - 200px)" }} className="history-scroll-container">
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <History size={32} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: "0.85rem" }}>No outfit history yet.</p>
            <p style={{ fontSize: "0.75rem", maxWidth: "180px" }}>Your rated outfits will appear here for comparison.</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              style={{
                display: "flex",
                gap: "12px",
                padding: "10px",
                background: activeId === item.id ? "rgba(157, 78, 221, 0.08)" : "rgba(0,0,0,0.12)",
                border: `1px solid ${activeId === item.id ? "var(--primary)" : "var(--surface-border)"}`,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "var(--transition)",
                position: "relative"
              }}
              className="glass-panel-hover history-item-card"
            >
              {/* Thumbnail */}
              <div style={{ width: "50px", height: "50px", borderRadius: "4px", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.05)" }}>
                <img src={item.image} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Info summary */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "4px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {formatOccasion(item.occasion)}
                  </h4>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    color: getScoreColor(item.result.score)
                  }}>
                    {item.result.score}
                  </span>
                </div>
                
                <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                    <Calendar size={10} />
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>

              {/* Delete Hover Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="history-delete-btn"
                style={{
                  position: "absolute",
                  right: "6px",
                  bottom: "6px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "var(--transition)",
                  opacity: 0
                }}
                title="Delete entry"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Clear All Footer */}
      {history.length > 0 && (
        <button
          onClick={onClear}
          style={{
            background: "rgba(255, 90, 95, 0.05)",
            border: "1px solid rgba(255, 90, 95, 0.15)",
            color: "#ff5a5f",
            padding: "10px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: "600",
            transition: "var(--transition)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
          className="clear-history-hover"
        >
          <Trash size={14} />
          Clear All Style Logs
        </button>
      )}

      <style>{`
        .history-item-card:hover .history-delete-btn {
          opacity: 0.8 !important;
        }
        .history-delete-btn:hover {
          color: var(--rating-poor) !important;
          background: rgba(255, 90, 95, 0.1) !important;
        }
        .clear-history-hover:hover {
          background: rgba(255, 90, 95, 0.15) !important;
          border-color: rgba(255, 90, 95, 0.4) !important;
          transform: translateY(-1px);
        }
        .history-scroll-container::-webkit-scrollbar {
          width: 4px;
        }
      `}</style>
    </aside>
  );
}
