import { useState, useEffect } from "react";
import { X, FileText, ChevronLeft, ChevronRight, Search, Loader2, AlertTriangle } from "lucide-react";
import { previewFile } from "../../services/api";

function DocumentPreviewModal({ isOpen, onClose, filePath, fileName }) {
    const [loading, setLoading] = useState(false);
    const [pages, setPages] = useState([]);
    const [error, setError] = useState("");
    const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-indexed internally
    const [searchQuery, setSearchQuery] = useState("");

    // ESC key listener to dismiss
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Fetch document preview on path change
    useEffect(() => {
        if (!isOpen || !filePath) return;
        
        const fetchPreview = async () => {
            setLoading(true);
            setError("");
            setPages([]);
            setCurrentPageIndex(0);
            setSearchQuery("");
            
            try {
                const res = await previewFile(filePath);
                if (res.success) {
                    setPages(res.pages || []);
                } else {
                    setError(res.message || "Could not retrieve document preview.");
                }
            } catch (err) {
                console.error("Preview fetch error:", err);
                setError(err.response?.data?.message || err.message || "Failed to load document content.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchPreview();
    }, [isOpen, filePath]);

    if (!isOpen) return null;

    const activePage = pages[currentPageIndex];
    const totalPages = pages.length;

    const handlePrevPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPageIndex < totalPages - 1) {
            setCurrentPageIndex(prev => prev + 1);
        }
    };

    // Helper to highlight matching text occurrences
    const highlightText = (text, query) => {
        if (!query.trim()) return text;
        
        // Escape regex special chars
        const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, "gi");
        
        const parts = text.split(regex);
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark key={index} className="search-highlight">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal-content preview-modal-content" 
                onClick={(e) => e.stopPropagation()} 
                style={{ 
                    maxWidth: "760px", 
                    width: "90%", 
                    height: "85vh", 
                    display: "flex", 
                    flexDirection: "column",
                    padding: "24px"
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "16px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                        <FileText size={22} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 className="modal-title" style={{ fontSize: "16px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={fileName}>
                                Preview: {fileName}
                            </h3>
                            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={filePath}>
                                {filePath}
                            </p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose} style={{ padding: "6px" }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Main Body */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                            <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-muted)" }}>Extracting document preview...</span>
                        </div>
                    ) : error ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "40px", textAlign: "center" }}>
                            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <AlertTriangle size={28} style={{ color: "#EF4444" }} />
                            </div>
                            <div>
                                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>Unable to load preview</h4>
                                <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", maxWidth: "360px", lineHeight: "1.5" }}>
                                    {error}
                                </p>
                            </div>
                            <button className="btn-secondary" onClick={onClose} style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                                Close
                            </button>
                        </div>
                    ) : pages.length === 0 ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                            This document contains no extractable text content.
                        </div>
                    ) : (
                        <>
                            {/* Toolbar (Search & Page Selectors) */}
                            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap" }}>
                                {/* Search */}
                                <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Search text in document..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ paddingLeft: "32px", width: "100%", height: "36px", fontSize: "13px" }}
                                    />
                                    <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--color-text-muted)" }} />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery("")}
                                            style={{ position: "absolute", right: "10px", top: "10px", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "11px", fontWeight: "600" }}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                        <button 
                                            type="button"
                                            className="icon-btn" 
                                            onClick={handlePrevPage} 
                                            disabled={currentPageIndex === 0}
                                            style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", height: "36px", width: "36px", padding: 0 }}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-main)", minWidth: "90px", textAlign: "center" }}>
                                            Page {currentPageIndex + 1} of {totalPages}
                                        </span>
                                        <button 
                                            type="button"
                                            className="icon-btn" 
                                            onClick={handleNextPage} 
                                            disabled={currentPageIndex === totalPages - 1}
                                            style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", height: "36px", width: "36px", padding: 0 }}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Document Text Display Sheet */}
                            <div 
                                className="document-sheet"
                                style={{ 
                                    flex: 1, 
                                    backgroundColor: "#FFFFFF", 
                                    border: "1px solid var(--color-border)", 
                                    borderRadius: "var(--radius-md)", 
                                    padding: "32px", 
                                    overflowY: "auto",
                                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                                    lineHeight: "1.6",
                                    fontSize: "14px",
                                    color: "#374151"
                                }}
                            >
                                {activePage && (
                                    <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-family)" }}>
                                        {highlightText(activePage.text, searchQuery)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
                    <button type="button" className="btn-primary" onClick={onClose} style={{ margin: 0, height: "36px", padding: "0 20px", fontSize: "13px", width: "auto" }}>
                        Done Viewing
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DocumentPreviewModal;
