import { useState } from "react";
import { X, FolderPlus, Loader2 } from "lucide-react";
import { addFolder } from "../../services/api";

function AddFolderModal({ isOpen, onClose, onFolderAdded }) {
    const [path, setPath] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!path.trim()) {
            setError("Please enter a valid folder path.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await addFolder(path.trim());

            if (response.success) {
                onFolderAdded(response.path);
                setPath("");
                onClose();
            } else {
                setError(response.message || "Failed to register folder.");
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "An error occurred while connecting to the backend.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FolderPlus className="sidebar-logo-icon" size={24} />
                        <h3 className="modal-title" style={{ margin: 0 }}>Add Knowledge Source</h3>
                    </div>
                    <button className="icon-btn" onClick={onClose} style={{ padding: "4px" }}>
                        <X size={20} />
                    </button>
                </div>
                
                <p className="modal-desc">
                    Enter the absolute path of a local folder you would like RecallX to add to your personal knowledge memory. Supported formats: PDF, DOCX, TXT.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Folder Path</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. /Users/username/Documents/MyNotes"
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                        {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: "auto", marginBottom: 0 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Adding source...
                                </>
                            ) : (
                                "Add Source"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddFolderModal;
