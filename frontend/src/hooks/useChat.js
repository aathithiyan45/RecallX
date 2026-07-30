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
            
            const isNotFound = !sources || sources.length === 0 || 
                answer.toLowerCase().includes("couldn't find") || 
                answer.toLowerCase().includes("could not find") || 
                answer.toLowerCase().includes("no information");

            let finalAnswer = answer;
            let formattedSources = [];

            if (isNotFound) {
                finalAnswer = "I couldn't find anything related to that in your knowledge library.";
                formattedSources = [];
            } else {
                formattedSources = (sources || []).map((src) => ({
                    file: src.file,
                    chunk: src.chunk,
                    page: src.page,
                    score: src.score,
                    text: src.text || "Segment from your recalled knowledge source."
                }));
            }

            // Add AI response to state
            setMessages((prev) => [
                ...prev,
                { 
                    text: finalAnswer, 
                    sender: "ai", 
                    sources: formattedSources,
                    isNotFound: isNotFound
                }
            ]);

            setCurrentSources(formattedSources);
            setBackendConnected(true);
            return { success: true, answer: finalAnswer, sources: formattedSources };
        } catch (err) {
            console.error("Chat API failure:", err);
            
            // Check if connection error or backend unavailable
            const isConnectionError = !err.response || err.code === "ERR_NETWORK" || err.message?.includes("Network Error");
            
            let friendlyError = "An unexpected error occurred.";
            if (isConnectionError) {
                friendlyError = "Unable to connect to RecallX backend. Please ensure the backend server is running.";
                setBackendConnected(false);
            } else {
                friendlyError = err.response?.data?.message || err.message || "Failed to retrieve from personal knowledge memory.";
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
