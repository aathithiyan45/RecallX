import { Search, BookOpen, Menu } from "lucide-react";

function Header({ showSources, onToggleSources, onToggleSidebar, backendConnected = true }) {
    return (
        <header className="header">
            {/* Left side */}
            <div className="header-left">
                <button className="hamburger-btn" onClick={onToggleSidebar} title="Open Sidebar">
                    <Menu size={18} />
                </button>
                <Search className="header-search-icon" size={18} />
                <span className="header-title">RecallX</span>
            </div>

            {/* Right side */}
            <div className="header-right">
                <div className="badge">Gemma 3 1B</div>
                <div className="status-indicator">
                    <span 
                        className="status-dot" 
                        style={!backendConnected ? { backgroundColor: "#DC2626" } : {}}
                    />
                    <span>{backendConnected ? "Local AI • Connected" : "Local AI • Disconnected"}</span>
                </div>
                
                {/* Sources sidebar toggle button */}
                <button
                    className={`icon-btn ${showSources ? "primary" : ""}`}
                    onClick={onToggleSources}
                    title="Toggle Knowledge References"
                    style={{ marginLeft: "8px" }}
                >
                    <BookOpen size={18} />
                </button>
            </div>
        </header>
    );
}

export default Header;