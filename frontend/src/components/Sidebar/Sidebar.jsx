import { useState, useEffect } from "react";
import { Brain, Folder, Plus, Settings, FolderOpen, MoreVertical, Search } from "lucide-react";

const groupHistory = (historyItems) => {
    if (!historyItems || historyItems.length === 0) return [];
    
    const today = [];
    const yesterday = [];
    const last7Days = [];
    const older = [];
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOf7DaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
    
    historyItems.forEach(item => {
        if (!item.created_at) return;
        const utcString = item.created_at.replace(" ", "T") + "Z";
        const date = new Date(utcString);
        const time = date.getTime();
        
        if (time >= startOfToday) {
            today.push(item);
        } else if (time >= startOfYesterday) {
            yesterday.push(item);
        } else if (time >= startOf7DaysAgo) {
            last7Days.push(item);
        } else {
            older.push(item);
        }
    });
    
    const groups = [];
    if (today.length > 0) groups.push({ title: "Today", items: today });
    if (yesterday.length > 0) groups.push({ title: "Yesterday", items: yesterday });
    if (last7Days.length > 0) groups.push({ title: "Last 7 Days", items: last7Days });
    if (older.length > 0) groups.push({ title: "Older", items: older });
    
    return groups;
};

function Sidebar({ 
    folders, 
    activeFolder, 
    setActiveFolder, 
    onOpenAddModal, 
    isOpen, 
    onClose,
    onViewFiles = () => {},
    onReindex = () => {},
    onRemove = () => {},
    history = [],
    onSelectHistory = () => {},
    onDeleteHistory = () => {},
    onClearHistory = () => {},
    onOpenSettings = () => {}
}) {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [openHistoryMenuId, setOpenHistoryMenuId] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Close the three-dot menu when clicking anywhere else
    useEffect(() => {
        const handleOutsideClick = () => {
            setOpenMenuId(null);
            setOpenHistoryMenuId(null);
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
            {/* Scrollable Container for Sources & Searches */}
            <div className="sidebar-scroll-container" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "28px", marginRight: "-8px", paddingRight: "8px", marginBottom: "16px" }}>
                
                {/* Knowledge Sources Section */}
                <div>
                    <div className="sidebar-section-title">Knowledge Sources</div>
                    <div className="sidebar-menu" style={{ overflowY: "visible" }}>
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
                </div>

                {/* Recent Searches Section */}
                <div>
                    <div className="sidebar-section-title">Recent Searches</div>
                    <div className="sidebar-menu" style={{ overflowY: "visible" }}>
                        {history.length === 0 ? (
                            <div className="sidebar-empty-state" style={{ padding: "8px 14px", fontSize: "13px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                                No previous searches.
                            </div>
                        ) : (
                            (() => {
                                const groups = groupHistory(history);
                                return (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {groups.map((group) => (
                                            <div key={group.title} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", paddingLeft: "8px", marginBottom: "4px" }}>
                                                    {group.title}
                                                </div>
                                                {group.items.map((item) => (
                                                    <div 
                                                        key={item.id}
                                                        className="sidebar-history-item"
                                                        onClick={() => onSelectHistory(item.query)}
                                                    >
                                                        <Search size={14} className="sidebar-history-icon" />
                                                        <span className="sidebar-history-text" title={item.query}>
                                                            {item.query}
                                                        </span>
                                                        
                                                        <div className="history-menu-wrapper" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                className="sidebar-history-more-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenHistoryMenuId(openHistoryMenuId === item.id ? null : item.id);
                                                                }}
                                                            >
                                                                <MoreVertical size={13} />
                                                            </button>
                                                            
                                                            {openHistoryMenuId === item.id && (
                                                                <div className="history-action-menu">
                                                                    <button onClick={() => { setOpenHistoryMenuId(null); onSelectHistory(item.query); }}>
                                                                        Run Again
                                                                    </button>
                                                                    <button className="danger" onClick={() => { setOpenHistoryMenuId(null); onDeleteHistory(item.id); }}>
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}

                                        {/* Clear History Button */}
                                        <div style={{ marginTop: "12px", paddingLeft: "4px", paddingRight: "4px" }}>
                                            {!showClearConfirm ? (
                                                <button 
                                                    onClick={() => setShowClearConfirm(true)}
                                                    style={{ 
                                                        background: "none", 
                                                        border: "none", 
                                                        color: "#DC2626", 
                                                        fontSize: "11px", 
                                                        fontWeight: "600", 
                                                        cursor: "pointer", 
                                                        padding: 0,
                                                        opacity: 0.8,
                                                        transition: "opacity 0.2s"
                                                    }}
                                                >
                                                    Clear History
                                                </button>
                                            ) : (
                                                <div className="clear-history-card">
                                                    <div className="clear-history-card-title">
                                                        Are you sure you want to clear all history?
                                                    </div>
                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                        <button 
                                                            onClick={() => { setShowClearConfirm(false); onClearHistory(); }}
                                                            className="clear-history-confirm-btn"
                                                            style={{ 
                                                                flex: 1,
                                                                backgroundColor: "#DC2626", 
                                                                color: "white", 
                                                                border: "none", 
                                                                padding: "6px 8px", 
                                                                borderRadius: "4px", 
                                                                fontSize: "11px", 
                                                                fontWeight: "600", 
                                                                cursor: "pointer",
                                                                transition: "background-color 0.2s"
                                                            }}
                                                        >
                                                            Yes, Clear
                                                        </button>
                                                        <button 
                                                            onClick={() => setShowClearConfirm(false)}
                                                            className="clear-history-cancel-btn"
                                                            style={{ 
                                                                flex: 1,
                                                                backgroundColor: "var(--bg-card)", 
                                                                color: "var(--color-text-main)", 
                                                                border: "1px solid var(--color-border)", 
                                                                padding: "6px 8px", 
                                                                borderRadius: "4px", 
                                                                fontSize: "11px", 
                                                                fontWeight: "600", 
                                                                cursor: "pointer",
                                                                transition: "all 0.2s"
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button className="sidebar-footer-btn" onClick={onOpenSettings}>
                    <Settings size={16} />
                    Settings
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;