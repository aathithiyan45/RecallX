import { useState, useEffect } from "react";
import { Brain, Folder, Plus, Settings, FolderOpen, MoreVertical } from "lucide-react";

function Sidebar({ 
    folders, 
    activeFolder, 
    setActiveFolder, 
    onOpenAddModal, 
    isOpen, 
    onClose,
    onViewFiles = () => {},
    onViewDetails = () => {},
    onReindex = () => {},
    onRemove = () => {}
}) {
    const [openMenuId, setOpenMenuId] = useState(null);

    // Close the three-dot menu when clicking anywhere else
    useEffect(() => {
        const handleOutsideClick = () => {
            setOpenMenuId(null);
        };
        document.addEventListener("click", handleOutsideClick);
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, []);

    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
            {/* Header / Logo */}
            <div className="sidebar-header">
                <Brain className="sidebar-logo-icon" size={24} />
                <span className="sidebar-title">RecallX</span>
            </div>
            <div className="sidebar-subtitle">Your personal knowledge memory</div>

            {/* Action Button */}
            <button className="btn-primary" onClick={onOpenAddModal}>
                <Plus size={16} />
                Add Knowledge Source
            </button>

            {/* Navigation / Folders Section */}
            <div className="sidebar-section-title">Knowledge Sources</div>
            <div className="sidebar-menu">
                {folders.length === 0 ? (
                    <div className="sidebar-empty-state" style={{ padding: "12px 14px", fontSize: "13px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                        No knowledge sources added yet.
                    </div>
                ) : (
                    folders.map((folder) => {
                        const isActive = activeFolder === folder.path;
                        const isMenuOpen = openMenuId === folder.path;

                        return (
                            <div
                                key={folder.id || folder.path}
                                className={`sidebar-item ${isActive ? "active" : ""}`}
                                onClick={() => setActiveFolder(isActive ? null : folder.path)}
                                style={{ position: "relative" }}
                            >
                                <div className="sidebar-item-left">
                                    {isActive ? (
                                        <FolderOpen size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                                    ) : (
                                        <Folder size={16} style={{ flexShrink: 0 }} />
                                    )}
                                    <span className="sidebar-item-text" title={folder.path}>
                                        {folder.name || folder.path.split("/").pop() || folder.path}
                                    </span>
                                </div>

                                <div className="sidebar-item-actions" onClick={(e) => e.stopPropagation()}>
                                    <span className="sidebar-item-badge">
                                        {folder.file_count || 0} {folder.file_count === 1 ? 'file' : 'files'}
                                    </span>
                                    <span 
                                        className={`sidebar-item-status ${folder.status === "indexing" ? "indexing" : ""}`} 
                                        title={folder.status === "indexing" ? "Indexing source..." : "Watching knowledge source"}
                                    />
                                    <div className="source-menu-wrapper">
                                        <button 
                                            className="sidebar-item-more-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(isMenuOpen ? null : folder.path);
                                            }}
                                            title="Actions"
                                        >
                                            <MoreVertical size={14} />
                                        </button>
                                        
                                        {isMenuOpen && (
                                            <div className="source-action-menu">
                                                <button onClick={() => { setOpenMenuId(null); onViewFiles(folder); }}>
                                                    View Details
                                                </button>
                                                <button onClick={() => { setOpenMenuId(null); onViewDetails(folder); }}>
                                                    View Details (Alt)
                                                </button>
                                                <button onClick={() => { setOpenMenuId(null); onReindex(folder); }}>
                                                    Re-index Source
                                                </button>
                                                <button className="danger" onClick={() => { setOpenMenuId(null); onRemove(folder); }}>
                                                    Remove Knowledge Source
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button className="sidebar-footer-btn">
                    <Settings size={16} />
                    Settings
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;