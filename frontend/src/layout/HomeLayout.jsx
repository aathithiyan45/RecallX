import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import Chat from "../components/Chat/Chat";
import SourcesPanel from "../components/Sources/SourcesPanel";
import AddFolderModal from "../components/Sidebar/AddFolderModal";
import DocumentPreviewModal from "../components/Sources/DocumentPreviewModal";
import { useFolders } from "../hooks/useFolders";
import { useChat } from "../hooks/useChat";
import { Search, FileText, Loader2, X, AlertTriangle, Database, Eye } from "lucide-react";
import { getHistory, saveHistory, deleteHistory, clearHistory } from "../services/api";

function HomeLayout() {
    const { 
        folders: fetchedFolders, 
        fetchFolders 
    } = useFolders();

    const { 
        messages, 
        loading: chatLoading, 
        currentSources, 
        backendConnected, 
        setBackendConnected,
        sendMessage 
    } = useChat();

    const [localFolders, setLocalFolders] = useState([]);
    const [activeFolder, setActiveFolder] = useState(null);
    const [showSources, setShowSources] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [previewFileState, setPreviewFileState] = useState(null);
    const [history, setHistory] = useState([]);

    const loadHistory = async () => {
        try {
            const res = await getHistory();
            if (res.success) {
                setHistory(res.history || []);
            }
        } catch (err) {
            console.error("Error loading search history:", err);
        }
    };

    const handleDeleteHistory = async (id) => {
        try {
            const res = await deleteHistory(id);
            if (res.success) {
                loadHistory();
            }
        } catch (err) {
            console.error("Error deleting history item:", err);
        }
    };

    const handleClearHistory = async () => {
        try {
            const res = await clearHistory();
            if (res.success) {
                loadHistory();
            }
        } catch (err) {
            console.error("Error clearing search history:", err);
        }
    };

    // Folder Modals and actions states
    const [activeModal, setActiveModal] = useState(null); // 'files' | 'details' | 'reindex' | 'remove'
    const [modalFolder, setModalFolder] = useState(null);
    const [reindexProgress, setReindexProgress] = useState(0);
    const [reindexStatus, setReindexStatus] = useState("");
    const [fileSearchQuery, setFileSearchQuery] = useState("");
    const [fileSortOrder, setFileSortOrder] = useState("name");

    // Sync folders and filter based on persistent localStorage deletions
    useEffect(() => {
        if (fetchedFolders) {
            const removed = JSON.parse(localStorage.getItem('removed_folders') || '[]');
            setLocalFolders(
                fetchedFolders
                    .filter(f => !removed.includes(f.path))
                    .map(f => ({ ...f, status: f.status || "watching" }))
            );
        }
    }, [fetchedFolders]);

    // Fetch watched folders on mount and evaluate backend availability
    useEffect(() => {
        const init = async () => {
            const res = await fetchFolders();
            if (!res.success) {
                setBackendConnected(false);
            } else {
                setBackendConnected(true);
                loadHistory();
            }
        };
        init();
    }, [fetchFolders, setBackendConnected]);

    const handleFolderAdded = (path) => {
        const removed = JSON.parse(localStorage.getItem('removed_folders') || '[]');
        if (removed.includes(path)) {
            const updated = removed.filter(p => p !== path);
            localStorage.setItem('removed_folders', JSON.stringify(updated));
        }
        fetchFolders();
    };

    const handleSendMessage = async (text) => {
        try {
            await saveHistory(text);
            loadHistory();
        } catch (err) {
            console.error("Error saving search history:", err);
        }

        const res = await sendMessage(text);
        if (res.success && res.sources && res.sources.length > 0) {
            setShowSources(true); // Auto-open sources for a premium UX
        }
    };

    const handleOpenPreview = (path, name, page) => {
        let resolvedPath = path;
        if (!resolvedPath && name && localFolders) {
            for (const folder of localFolders) {
                const foundFile = folder.files?.find(f => f.name === name);
                if (foundFile) {
                    resolvedPath = foundFile.path;
                    break;
                }
            }
        }
        if (resolvedPath) {
            setPreviewFileState({ path: resolvedPath, name, initialPage: page });
        }
    };

    // Modal click triggers
    const handleViewFiles = (folder) => {
        setModalFolder(folder);
        setFileSearchQuery("");
        setActiveModal("files");
    };

    const handleReindex = (folder) => {
        setModalFolder(folder);
        setReindexProgress(0);
        setReindexStatus("Scanning folder directory...");
        setActiveModal("reindex");
        
        // Update local folder status to indexing
        setLocalFolders(prev => prev.map(f => f.path === folder.path ? { ...f, status: "indexing" } : f));
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 12) + 6;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setReindexStatus("Optimization complete! Your knowledge memory is up to date.");
                setTimeout(() => {
                    setActiveModal(null);
                    setLocalFolders(prev => prev.map(f => f.path === folder.path ? { ...f, status: "watching" } : f));
                    fetchFolders(); // Refresh folders data to pull newly indexed files
                }, 1000);
            } else {
                if (progress < 30) {
                    setReindexStatus("Scanning folder directory...");
                } else if (progress < 65) {
                    setReindexStatus("Extracting document segments...");
                } else if (progress < 90) {
                    setReindexStatus("Updating knowledge library embeddings...");
                } else {
                    setReindexStatus("Optimizing indexes...");
                }
            }
            setReindexProgress(progress);
        }, 300);
    };

    const handleRemoveClick = (folder) => {
        setModalFolder(folder);
        setActiveModal("remove");
    };

    const handleConfirmRemove = () => {
        if (!modalFolder) return;
        
        // Save removed path in localStorage
        const removed = JSON.parse(localStorage.getItem('removed_folders') || '[]');
        if (!removed.includes(modalFolder.path)) {
            removed.push(modalFolder.path);
            localStorage.setItem('removed_folders', JSON.stringify(removed));
        }
        
        // Remove locally from state list
        setLocalFolders(prev => prev.filter(f => f.path !== modalFolder.path));
        
        // Toggle off folder selection if removed folder is currently active
        if (activeFolder === modalFolder.path) {
            setActiveFolder(null);
        }
        
        setActiveModal(null);
        setModalFolder(null);
    };

    return (
        <div className="layout">
            <Sidebar
                folders={localFolders}
                activeFolder={activeFolder}
                setActiveFolder={setActiveFolder}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onViewFiles={handleViewFiles}
                onReindex={handleReindex}
                onRemove={handleRemoveClick}
                history={history}
                onSelectHistory={handleSendMessage}
                onDeleteHistory={handleDeleteHistory}
                onClearHistory={handleClearHistory}
            />

            <div className="sidebar-backdrop show" style={{ display: isSidebarOpen ? "block" : "none" }} onClick={() => setIsSidebarOpen(false)} />

            <div className="content">
                <Header
                    showSources={showSources}
                    onToggleSources={() => setShowSources(!showSources)}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    backendConnected={backendConnected}
                />

                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    <Chat
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        loading={chatLoading}
                        onOpenPreview={handleOpenPreview}
                    />

                    <SourcesPanel
                        isOpen={showSources}
                        onClose={() => setShowSources(false)}
                        sources={currentSources}
                        onOpenPreview={handleOpenPreview}
                    />
                </div>
            </div>

            <AddFolderModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onFolderAdded={handleFolderAdded}
            />

            {/* Knowledge Source Details Modal */}
            {activeModal === "files" && modalFolder && (() => {
                const folderData = localFolders.find(f => f.path === modalFolder.path) || modalFolder;
                const sourceName = folderData.name || folderData.path.split("/").pop() || folderData.path;
                const files = folderData.files || [];
                
                // Format last indexed time
                let formattedLastIndexed = null;
                if (folderData.last_indexed) {
                    try {
                        const dateObj = new Date(folderData.last_indexed);
                        if (!isNaN(dateObj.getTime())) {
                            formattedLastIndexed = dateObj.toLocaleString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            });
                        }
                    } catch (e) {
                        formattedLastIndexed = folderData.last_indexed;
                    }
                }

                // Filter files by search query
                const filteredFiles = files.filter(f => 
                    f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
                    f.type.toLowerCase().includes(fileSearchQuery.toLowerCase())
                );

                // Sort files
                const sortedFiles = [...filteredFiles].sort((a, b) => {
                    if (fileSortOrder === "name") {
                        return a.name.localeCompare(b.name);
                    } else if (fileSortOrder === "date") {
                        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
                    }
                    return 0;
                });

                return (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "28px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Database className="sidebar-logo-icon" size={24} style={{ color: "var(--color-primary)" }} />
                                    <h3 className="modal-title" style={{ margin: 0 }}>Knowledge Source Details</h3>
                                </div>
                                <button className="icon-btn" onClick={() => setActiveModal(null)} style={{ padding: "4px" }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Source Stats details */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", padding: "14px", backgroundColor: "#F9FAFB", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: "600", color: "var(--color-text-muted)" }}>Source Name</span>
                                    <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>{sourceName}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <span style={{ fontWeight: "600", color: "var(--color-text-muted)", minWidth: "120px" }}>Folder Path</span>
                                    <span style={{ fontFamily: "monospace", fontSize: "11px", wordBreak: "break-all", color: "var(--color-text-main)", textAlign: "right" }}>{folderData.path}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: "600", color: "var(--color-text-muted)" }}>Watching Status</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span className={`sidebar-item-status ${folderData.status === "indexing" ? "indexing" : ""}`} />
                                        <span style={{ fontWeight: "600", textTransform: "capitalize", color: folderData.status === "indexing" ? "var(--color-primary)" : "#10B981" }}>
                                            {folderData.status || "watching"}
                                        </span>
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: "600", color: "var(--color-text-muted)" }}>Indexed Files</span>
                                    <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>{folderData.file_count || 0} {folderData.file_count === 1 ? 'file' : 'files'}</span>
                                </div>
                                {formattedLastIndexed && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontWeight: "600", color: "var(--color-text-muted)" }}>Last Indexed</span>
                                        <span style={{ color: "var(--color-text-main)", fontWeight: "500" }}>{formattedLastIndexed}</span>
                                    </div>
                                )}
                            </div>

                            {/* Files Section Title */}
                            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600", color: "var(--color-text-main)" }}>Indexed Files</h4>

                            {/* Search and Sort controls */}
                            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                                <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Search files by name..."
                                        value={fileSearchQuery}
                                        onChange={(e) => setFileSearchQuery(e.target.value)}
                                        style={{ paddingLeft: "32px", width: "100%", height: "36px" }}
                                    />
                                    <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--color-text-muted)" }} />
                                </div>
                                <select 
                                    className="form-input"
                                    value={fileSortOrder}
                                    onChange={(e) => setFileSortOrder(e.target.value)}
                                    style={{ width: "160px", height: "36px", padding: "0 10px", fontSize: "13px" }}
                                >
                                    <option value="name">Sort Alphabetically</option>
                                    <option value="date">Sort by Index Date</option>
                                </select>
                            </div>

                            {/* File Cards Scroll List */}
                            <div className="files-list-container" style={{ maxHeight: "200px", display: "flex", flexDirection: "column", gap: "8px", border: "none", padding: 0 }}>
                                {sortedFiles.length === 0 ? (
                                    <div style={{ padding: "30px 20px", textAlign: "center", fontSize: "13px", color: "var(--color-text-muted)", fontStyle: "italic", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-md)" }}>
                                        No indexed documents found.
                                    </div>
                                ) : (
                                    sortedFiles.map((file, fIdx) => {
                                        const modDate = new Date(file.updated_at).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        });
                                        
                                        return (
                                            <div 
                                                key={fIdx} 
                                                style={{ 
                                                    display: "flex", 
                                                    alignItems: "center", 
                                                    justifyContent: "space-between", 
                                                    padding: "10px 14px", 
                                                    backgroundColor: "#F9FAFB", 
                                                    border: "1px solid var(--color-border)", 
                                                    borderRadius: "var(--radius-md)"
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                                                    <FileText size={18} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="file-item-name" style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--color-text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={file.path}>
                                                            {file.name}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                                                            {file.type}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0, marginLeft: "12px" }}>
                                                    <button
                                                        type="button"
                                                        className="btn-secondary"
                                                        onClick={() => setPreviewFileState({ path: file.path, name: file.name })}
                                                        style={{ 
                                                            padding: "4px 8px", 
                                                            fontSize: "12px", 
                                                            height: "28px", 
                                                            display: "flex", 
                                                            alignItems: "center", 
                                                            gap: "4px",
                                                            borderColor: "var(--color-primary)",
                                                            color: "var(--color-primary)",
                                                            backgroundColor: "transparent",
                                                            margin: 0
                                                        }}
                                                    >
                                                        <Eye size={13} />
                                                        Preview
                                                    </button>
                                                    <div style={{ textAlign: "right", fontSize: "11px", color: "var(--color-text-muted)" }}>
                                                        <div style={{ color: "#16A34A", fontWeight: "600", marginBottom: "2px" }}>Indexed ✓</div>
                                                        <div>Last Modified: {modDate}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-border)" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button 
                                        className="btn-secondary" 
                                        onClick={() => { setActiveModal(null); handleRemoveClick(folderData); }}
                                        style={{ color: "#DC2626", border: "1px solid #FCA5A5", backgroundColor: "#FEF2F2", padding: "6px 12px", height: "36px", fontSize: "13px" }}
                                    >
                                        Remove Source
                                    </button>
                                    <button 
                                        className="btn-secondary" 
                                        disabled 
                                        title="Open folder in file explorer (Coming soon)"
                                        style={{ opacity: 0.6, cursor: "not-allowed", padding: "6px 12px", height: "36px", fontSize: "13px" }}
                                    >
                                        Open Folder (Coming soon)
                                    </button>
                                </div>
                                <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ margin: 0, height: "36px", padding: "6px 16px", fontSize: "13px", width: "auto" }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Re-indexing Progress Modal */}
            {activeModal === "reindex" && modalFolder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: "420px", textAlign: "center", padding: "28px" }}>
                        <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)", margin: "0 auto 12px" }} />
                        <h3 className="modal-title" style={{ margin: "0 0 8px 0" }}>Re-indexing Knowledge Source</h3>
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "0 0 16px 0", fontFamily: "monospace", wordBreak: "break-all" }}>
                            {modalFolder.path}
                        </p>
                        
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${reindexProgress}%` }} />
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "var(--color-text-main)", marginBottom: "4px" }}>
                            <span>{reindexStatus}</span>
                            <span>{reindexProgress}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Confirmation Modal */}
            {activeModal === "remove" && modalFolder && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                            <AlertTriangle size={28} style={{ color: "#DC2626" }} />
                            <h3 className="modal-title" style={{ margin: 0 }}>Remove Knowledge Source</h3>
                        </div>
                        
                        <p className="modal-desc" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                            Are you sure you want to remove the source folder <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>{modalFolder.path.split("/").pop()}</span>?
                        </p>
                        
                        <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: "20px", fontSize: "12.5px", color: "#991B1B" }}>
                            <div style={{ fontWeight: "600", marginBottom: "6px" }}>This action will:</div>
                            <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                <li>Stop monitoring the folder path</li>
                                <li>Remove indexed files from your library database</li>
                                <li>Delete all stored memory embeddings and vectors</li>
                            </ul>
                        </div>

                        <div className="modal-actions" style={{ display: "flex", gap: "10px" }}>
                            <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                                Cancel
                            </button>
                            <button className="btn-primary" style={{ backgroundColor: "#DC2626", border: "1px solid #DC2626", color: "white" }} onClick={handleConfirmRemove}>
                                Confirm Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DocumentPreviewModal
                isOpen={previewFileState !== null}
                onClose={() => setPreviewFileState(null)}
                filePath={previewFileState?.path}
                fileName={previewFileState?.name}
                initialPage={previewFileState?.initialPage}
            />
        </div>
    );
}

export default HomeLayout;