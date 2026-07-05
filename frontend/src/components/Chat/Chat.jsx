import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Paperclip, Bot, User, Sparkles } from "lucide-react";

function Chat({ messages, onSendMessage, loading }) {
    const [input, setInput] = useState("");
    const chatEndRef = useRef(null);

    // Auto scroll to bottom when messages or loading changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

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
                                    {!isUser && msg.sources && msg.sources.length > 0 && (
                                        <div className="message-retrieval-header" style={{ marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "var(--color-text-main)" }}>
                                            📄 Retrieved from {msg.sources[0].file}
                                        </div>
                                    )}
                                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
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
                    <div className="message-bubble ai">
                        <div className="avatar ai">
                            <Bot size={16} />
                        </div>
                        <div className="message-content">
                            <div className="typing-placeholder">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
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