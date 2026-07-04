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
                        <h2 className="welcome-title">Ask anything about your documents</h2>
                        <p className="welcome-subtitle">
                            RecallX searches your local files using semantic search and generates grounded AI answers.
                        </p>
                        
                        <div className="suggestions-grid">
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Summarize my Java notes")}>
                                Summarize my Java notes →
                            </div>
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Explain Machine Learning")}>
                                Explain Machine Learning →
                            </div>
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Search for Python examples")}>
                                Search for Python examples →
                            </div>
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("What is RAG?")}>
                                What is RAG? →
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
                                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                                    {!isUser && msg.sources && msg.sources.length > 0 && (
                                        <div className="message-sources" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <div style={{ fontWeight: "700", color: "var(--color-text-main)", fontSize: "13px" }}>Sources</div>
                                            {msg.sources.map((src, sIdx) => (
                                                <div key={sIdx} style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                                                    <div style={{ color: "var(--color-primary)", fontWeight: "600" }}>{src.file}</div>
                                                    <div>Chunk {src.chunk}</div>
                                                    <div>Score {src.score !== undefined ? src.score : ""}</div>
                                                </div>
                                            ))}
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
                        placeholder="Ask anything about your documents..."
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