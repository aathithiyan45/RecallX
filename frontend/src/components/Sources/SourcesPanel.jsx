import { X, FileText } from "lucide-react";

function SourcesPanel({ isOpen, onClose, sources, onOpenPreview }) {
    if (!isOpen) return null;

    const handleSourceClick = (src) => {
        console.log("Visual navigation click on source card:", src);
        if (onOpenPreview && src.path) {
            onOpenPreview(src.path, src.file, src.page, src.text);
        }
    };

    const getMatchQuality = (score) => {
        if (score === undefined || score === null) return "🟢 Good Match";
        const percentage = Math.max(5, Math.min(99, Math.round((1 - score / 1.6) * 100)));
        if (percentage >= 85) return `🟢 Strong Match (${percentage}% Relevant)`;
        if (percentage >= 70) return `🟡 Good Match (${percentage}% Relevant)`;
        return `🔴 Weak Match (${percentage}% Relevant)`;
    };

    return (
        <aside className={`sources-panel ${isOpen ? "open" : ""}`}>
            <div className="sources-header">
                <span className="sources-title">Knowledge References</span>
                <button className="icon-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="sources-list">
                {sources.length === 0 ? (
                    <div style={{ fontSize: "14px", color: "var(--color-text-muted)", textAlign: "center", marginTop: "40px" }}>
                        Search your knowledge to see where your recalled information came from.
                    </div>
                ) : (
                    sources.map((src, index) => {
                        const pagePresent = src.page !== undefined && src.page !== null && src.page !== "";
                        
                        return (
                            <div 
                                key={index} 
                                className="source-card"
                                onClick={() => handleSourceClick(src)}
                                title="Click to open this document at the matched page"
                                style={{ cursor: "pointer" }}
                            >
                                <div className="source-card-header" style={{ alignItems: "flex-start", marginBottom: "8px" }}>
                                    <div style={{ display: "flex", gap: "8px", minWidth: 0, flex: 1 }}>
                                        <FileText size={16} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }} />
                                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                            <span className="source-filename" title={src.file}>
                                                {src.file}
                                            </span>
                                            {pagePresent && (
                                                <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px", fontWeight: "600" }}>
                                                    Page {src.page}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {src.score !== undefined && (
                                        <span className="source-score" title="Match quality" style={{ flexShrink: 0 }}>
                                            {getMatchQuality(src.score)}
                                        </span>
                                    )}
                                </div>
                                
                                {src.text && (
                                    <div className="source-text" title={src.text} style={{ maxHeight: "150px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                        "{src.text}"
                                    </div>
                                )}

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "2px" }}>
                                        {src.file?.toLowerCase().endsWith(".pdf") ? "Open PDF →" : "Open Document →"}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}

export default SourcesPanel;
