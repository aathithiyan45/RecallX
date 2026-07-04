import { useState, useCallback } from "react";
import apiService from "../services/api";

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentSources, setCurrentSources] = useState([]);
    const [backendConnected, setBackendConnected] = useState(true);

    const sendMessage = useCallback(async (text) => {
        // Add user message
        const userMsg = { text, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);
        setError(null);

        try {
            const data = await apiService.askQuestion(text);
            
            // Extract answer and sources
            const { answer, sources } = data;
            
            const formattedSources = (sources || []).map((src) => ({
                file: src.file,
                chunk: src.chunk,
                score: src.score,
                text: src.text || "Matching document segment used to generate response."
            }));

            // Add AI response to state
            setMessages((prev) => [
                ...prev,
                { text: answer, sender: "ai", sources: formattedSources }
            ]);

            setCurrentSources(formattedSources);
            setBackendConnected(true);
            return { success: true, answer, sources: formattedSources };
        } catch (err) {
            console.error("Chat API failure:", err);
            
            // Check if connection error or backend unavailable
            const isConnectionError = !err.response || err.code === "ERR_NETWORK" || err.message?.includes("Network Error");
            
            let friendlyError = "An unexpected error occurred.";
            if (isConnectionError) {
                friendlyError = "Unable to connect to RecallX backend. Please ensure the backend server is running.";
                setBackendConnected(false);
            } else {
                friendlyError = err.response?.data?.message || err.message || "Failed to get response from assistant.";
            }

            setError(friendlyError);
            
            // Show friendly error message in the chat feed as an AI message, so it doesn't crash the application
            setMessages((prev) => [
                ...prev,
                { text: friendlyError, sender: "ai" }
            ]);
            setCurrentSources([]);
            return { success: false, error: friendlyError };
        } finally {
            setLoading(false);
        }
    }, []);

    const clearChat = useCallback(() => {
        setMessages([]);
        setCurrentSources([]);
        setError(null);
    }, []);

    return {
        messages,
        loading,
        error,
        currentSources,
        setCurrentSources,
        backendConnected,
        setBackendConnected,
        sendMessage,
        clearChat
    };
}
