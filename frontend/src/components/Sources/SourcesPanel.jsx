import { X, FileText, BarChart } from "lucide-react";

function SourcesPanel({ isOpen, onClose, sources }) {
    if (!isOpen) return null;

    return (
        <aside className={`sources-panel ${isOpen ? "open" : ""}`}>
            <div className="sources-header">
                <span className="sources-title">Sources</span>
                <button className="icon-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="sources-list">
                {sources.length === 0 ? (
                    <div style={{ fontSize: "14px", color: "var(--color-text-muted)", textAlign: "center", marginTop: "40px" }}>
                        Ask a question to see document sources used for RAG generation.
                    </div>
                ) : (
                    sources.map((src, index) => (
                        <div key={index} className="source-card">
                            <div className="source-card-header">
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                                    <FileText size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                                    <span className="source-filename" title={src.file}>
                                        {src.file}
                                    </span>
                                </div>
                                {src.score !== undefined && (
                                    <span className="source-score" title="Relevance match score">
                                        {(src.score * 100).toFixed(0)}% match
                                    </span>
                                )}
                            </div>
                            
                            <div className="source-chunk">
                                Chunk #{src.chunk !== undefined ? src.chunk : index + 1}
                            </div>
                            
                            {src.text && (
                                <div className="source-text" title={src.text}>
                                    "{src.text}"
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

export default SourcesPanel;
