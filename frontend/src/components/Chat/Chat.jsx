import { SendHorizontal, Paperclip, Bot, User, Sparkles, FileText, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const getMatchQuality = (score) => {
    if (score === undefined || score === null) return "🟢 Good Match";
    const percentage = Math.max(5, Math.min(99, Math.round((1 - score / 1.6) * 100)));
    if (percentage >= 85) return `🟢 Strong Match`;
    if (percentage >= 70) return `🟡 Good Match`;
    return `🔴 Weak Match`;
};

const renderMarkdown = (text) => {
    if (!text) return null;
    
    // Split text into lines
    const lines = text.split("\n");
    
    const formattedLines = lines.map((line, idx) => {
        let trimmed = line.trim();
        
        // Horizontal Rule
        if (trimmed === "---") {
            return <hr key={idx} style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--color-border)" }} />;
        }
        
        // Bullet Points
        const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
        if (isBullet) {
            trimmed = trimmed.substring(2).trim();
        }
        
        // Parse bold elements within the line: **text**
        const parts = [];
        let lastIndex = 0;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let match;
        
        while ((match = boldRegex.exec(trimmed)) !== null) {
            const matchIndex = match.index;
            if (matchIndex > lastIndex) {
                parts.push(trimmed.substring(lastIndex, matchIndex));
            }
            parts.push(<strong key={matchIndex} style={{ color: "var(--color-text-main)", fontWeight: "700" }}>{match[1]}</strong>);
            lastIndex = boldRegex.lastIndex;
        }
        
        if (lastIndex < trimmed.length) {
            parts.push(trimmed.substring(lastIndex));
        }
        
        const content = parts.length > 0 ? parts : trimmed;
        
        if (isBullet) {
            return (
                <li key={idx} style={{ marginLeft: "20px", marginBottom: "6px", listStyleType: "disc", color: "var(--color-text-muted)", lineHeight: "1.6" }}>
                    {content}
                </li>
            );
        }
        
        // Check if the line is a header
        const isHeader = line.startsWith("### ") || line.startsWith("## ") || line.startsWith("# ");
        if (isHeader) {
            const level = line.startsWith("### ") ? 3 : line.startsWith("## ") ? 2 : 1;
            const headerText = line.replace(/^#+\s+/, "");
            const HeaderTag = `h${level + 1}`;
            return (
                <HeaderTag key={idx} style={{ marginTop: "16px", marginBottom: "8px", fontWeight: "700", color: "var(--color-text-main)" }}>
                    {headerText}
                </HeaderTag>
            );
        }
        
        if (trimmed === "") {
            return <div key={idx} style={{ height: "8px" }} />;
        }
        
        return (
            <p key={idx} style={{ margin: "0 0 8px 0", color: "var(--color-text-muted)", lineHeight: "1.6" }}>
                {content}
            </p>
        );
    });
    
    return <div className="markdown-body" style={{ width: "100%" }}>{formattedLines}</div>;
};

function Chat({ messages, onSendMessage, loading, onOpenPreview }) {
    const [input, setInput] = useState("");
    const [loadingStep, setLoadingStep] = useState(0);
    const chatEndRef = useRef(null);

    // Auto scroll to bottom when messages or loading changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Step-by-step loading animation effect
    useEffect(() => {
        if (!loading) {
            setLoadingStep(0);
            return;
        }

        const interval = setInterval(() => {
            setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
        }, 1200);

        return () => clearInterval(interval);
    }, [loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        onSendMessage(input.trim());
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    const handleSuggestionClick = (question) => {
        if (loading) return;
        onSendMessage(question);
    };

    return (
        <div className="chat-container">
            {/* Chat Messages scroll area */}
            <div className="chat">
                {messages.length === 0 ? (
                    <div className="welcome-section">
                        <div className="welcome-icon-wrapper">
                            <Sparkles size={28} />
                        </div>
                        <h2 className="welcome-title">Never lose knowledge you've already learned.</h2>
                        <p className="welcome-subtitle">
                            RecallX continuously builds a searchable memory of your local documents so you can instantly rediscover information whenever you need it.
                        </p>
                        
                        <div className="suggestions-grid">
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Where did I read about JWT authentication?")}>
                                Where did I read about JWT authentication? →
                            </div>
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Find my notes about React Hooks.")}>
                                Find my notes about React Hooks. →
                            </div>
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Which document mentions FastAPI?")}>
                                Which document mentions FastAPI? →
                            </div>
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Summarize everything I saved about Machine Learning.")}>
                                Summarize everything I saved about Machine Learning. →
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isUser = msg.sender === "user";
                        return (
                            <div key={index} className={`message-bubble ${isUser ? "user" : "ai"}`}>
                                <div className={`avatar ${isUser ? "user" : "ai"}`}>
                                    {isUser ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className="message-content">
                                    {/* AI Answer Text */}
                                    <div>
                                        {(() => {
                                            if (isUser) {
                                                return <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>;
                                            }
                                            // Strip any legacy prepended source headers
                                            let cleanText = msg.text || "";
                                            cleanText = cleanText.replace(/^📄 Source\n[^\n]+(\n📑 Page \d+)?\n+/g, "");
                                            cleanText = cleanText.replace(/^📄 Source\n.*\n(📑 Page .*\n)?\n+/g, "");
                                            const textToRender = cleanText.trim ? cleanText.trim() : cleanText;
                                            return renderMarkdown(textToRender);
                                        })()}
                                    </div>

                                    {/* Single source block at the bottom */}
                                    {!isUser && msg.sources && msg.sources.length > 0 && (
                                        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
                                            <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--color-text-muted)" }}>
                                                Source
                                            </div>
                                            <div 
                                                onClick={() => onOpenPreview && onOpenPreview(msg.sources[0].path, msg.sources[0].file, msg.sources[0].page)}
                                                className="chat-source-row"
                                                style={{ 
                                                    display: "flex", 
                                                    flexWrap: "wrap", 
                                                    alignItems: "center", 
                                                    gap: "12px", 
                                                    fontSize: "13px",
                                                    cursor: onOpenPreview ? "pointer" : "default",
                                                    padding: "8px 12px",
                                                    borderRadius: "var(--radius-sm)",
                                                    border: "1px solid var(--color-border)",
                                                    backgroundColor: "#F9FAFB",
                                                    transition: "var(--transition-smooth)",
                                                    width: "100%"
                                                }}
                                                title={onOpenPreview ? "Click to open this document at the matched page" : ""}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <FileText size={15} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                                                    <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>
                                                        {msg.sources[0].file}
                                                    </span>
                                                </div>
                                                {msg.sources[0].page && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-muted)", fontWeight: "500" }}>
                                                        📑 Page {msg.sources[0].page}
                                                    </div>
                                                )}
                                                <span className="source-score" style={{ fontSize: "11px", fontWeight: "600", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#EFF6FF", border: "1px solid #DBEAFE", color: "var(--color-primary)", display: "inline-flex", alignItems: "center" }}>
                                                    {getMatchQuality(msg.sources[0].score)}
                                                </span>
                                                <span 
                                                    style={{ 
                                                        marginLeft: "auto",
                                                        color: "var(--color-primary)", 
                                                        fontWeight: "600", 
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    {msg.sources[0].file?.toLowerCase().endsWith(".pdf") ? "[Open PDF]" : "[Open Document]"}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {!isUser && msg.isNotFound && (
                                         <div className="suggestions-block" style={{ marginTop: "14px", padding: "12px 16px", backgroundColor: "var(--bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "13px" }}>
                                             <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--color-text-main)" }}>Suggestions</div>
                                             <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "6px", color: "var(--color-text-muted)", listStyleType: "disc" }}>
                                                 <li>Try another keyword</li>
                                                 <li>Search using a broader topic</li>
                                                 <li>Make sure the relevant folder has been indexed</li>
                                             </ul>
                                         </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing status */}
                {loading && (
                    <div className="message-bubble ai animate-fade-in">
                        <div className="avatar ai">
                            <Bot size={16} />
                        </div>
                        <div className="message-content">
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "8px 4px" }}>
                                {[
                                    "Searching Knowledge...",
                                    "Embedding Query...",
                                    "Searching ChromaDB...",
                                    "Generating Answer..."
                                ].map((stepText, idx) => {
                                    const isCompleted = idx < loadingStep;
                                    const isActive = idx === loadingStep;
                                    const isWaiting = idx > loadingStep;

                                    return (
                                        <div 
                                            key={stepText}
                                            style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "10px",
                                                fontSize: "13px",
                                                fontWeight: isActive ? "600" : "500",
                                                color: isActive ? "var(--color-primary)" : isCompleted ? "#10B981" : "var(--color-text-muted)",
                                                opacity: isWaiting ? 0.4 : 1,
                                                transition: "all 0.3s ease",
                                                transform: isActive ? "scale(1.02)" : "scale(1)",
                                                transformOrigin: "left center"
                                            }}
                                        >
                                            {isCompleted ? (
                                                <span style={{ color: "#10B981", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", fontSize: "12px", fontWeight: "700" }}>✓</span>
                                            ) : isActive ? (
                                                <Loader2 className="animate-spin" size={14} style={{ color: "var(--color-primary)" }} />
                                            ) : (
                                                <span style={{ display: "inline-block", width: "14px", height: "14px", borderRadius: "50%", border: "1.5px solid var(--color-border)" }} />
                                            )}
                                            <span>{stepText}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Scroll Target */}
                <div ref={chatEndRef} />
            </div>

            {/* Bottom input area */}
            <div className="input-panel">
                <form onSubmit={handleSubmit} className="input-container">
                    <button type="button" className="icon-btn" title="Attach file">
                        <Paperclip size={18} />
                    </button>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Search your knowledge..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="icon-btn primary"
                        disabled={!input.trim() || loading}
                        style={{ padding: "8px 12px" }}
                    >
                        <SendHorizontal size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Chat;