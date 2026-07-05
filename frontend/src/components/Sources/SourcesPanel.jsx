import { X, FileText } from "lucide-react";

function SourcesPanel({ isOpen, onClose, sources }) {
    if (!isOpen) return null;

    const handleSourceClick = (src) => {
        console.log("Visual navigation click on source card:", src);
    };

    const getMatchQuality = (score) => {
        if (score === undefined || score === null) return "Good Match";
        const percentage = Math.max(5, Math.min(99, Math.round((1 - score / 1.6) * 100)));
        if (percentage >= 85) return `Strong Match (${percentage}% Relevant)`;
        if (percentage >= 70) return `Good Match (${percentage}% Relevant)`;
        return `Fair Match (${percentage}% Relevant)`;
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
                        const headingPresent = src.heading !== undefined && src.heading !== null && src.heading !== "";
                        
                        const details = [];
                        if (pagePresent) details.push(`Page ${src.page}`);
                        if (headingPresent) details.push(src.heading);
                        details.push(`Segment ${src.chunk !== undefined ? src.chunk + 1 : index + 1}`);

                        return (
                            <div 
                                key={index} 
                                className="source-card"
                                onClick={() => handleSourceClick(src)}
                                title="Click to open source document at the matched location (Coming soon)"
                                style={{ cursor: "pointer" }}
                            >
                                <div className="source-card-header">
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                                        <FileText size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                                        <span className="source-filename" title={src.file}>
                                            {src.file}
                                        </span>
                                    </div>
                                    {src.score !== undefined && (
                                        <span className="source-score" title="Match quality">
                                            {getMatchQuality(src.score)}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="source-chunk-details" style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                                    {details.map((detail, dIdx) => (
                                        <span key={dIdx} style={{ display: "flex", alignItems: "center" }}>
                                            {detail}
                                            {dIdx < details.length - 1 && <span style={{ margin: "0 6px", color: "var(--color-text-muted)", opacity: 0.6 }}>•</span>}
                                        </span>
                                    ))}
                                </div>
                                
                                {src.text && (
                                    <div className="source-text" title={src.text} style={{ maxHeight: "150px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                        "{src.text}"
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}

export default SourcesPanel;
