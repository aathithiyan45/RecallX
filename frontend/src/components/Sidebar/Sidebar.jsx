import { Brain, Folder, Plus, Settings, FolderOpen } from "lucide-react";

function Sidebar({ folders, activeFolder, setActiveFolder, onOpenAddModal, isOpen, onClose }) {
    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
            {/* Header / Logo */}
            <div className="sidebar-header">
                <Brain className="sidebar-logo-icon" size={24} />
                <span className="sidebar-title">RecallX</span>
            </div>
            <div className="sidebar-subtitle">Your AI Knowledge Assistant</div>

            {/* Action Button */}
            <button className="btn-primary" onClick={onOpenAddModal}>
                <Plus size={16} />
                Add Folder
            </button>

            {/* Navigation / Folders Section */}
            <div className="sidebar-section-title">Watched Folders</div>
            <div className="sidebar-menu">
                {folders.length === 0 ? (
                    <div className="sidebar-empty-state" style={{ padding: "12px 14px", fontSize: "13px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                        No watched folders yet.
                    </div>
                ) : (
                    folders.map((folder) => {
                        const isActive = activeFolder === folder.path;
                        return (
                            <div
                                key={folder.id || folder.path}
                                className={`sidebar-item ${isActive ? "active" : ""}`}
                                onClick={() => setActiveFolder(isActive ? null : folder.path)}
                            >
                                <div className="sidebar-item-left">
                                    {isActive ? (
                                        <FolderOpen size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                                    ) : (
                                        <Folder size={16} style={{ flexShrink: 0 }} />
                                    )}
                                    <span className="sidebar-item-text" title={folder.path}>
                                        {folder.path.split("/").pop() || folder.path}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button className="sid
                ebar-footer-btn">
                    <Settings size={16} />
                    Settings
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;