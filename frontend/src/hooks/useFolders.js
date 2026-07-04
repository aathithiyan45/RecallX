import { useState, useCallback } from "react";
import apiService from "../services/api";

export function useFolders() {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFolders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getFolders();
            setFolders(data);
            return { success: true, data };
        } catch (err) {
            console.error("Failed to fetch folders:", err);
            const msg = err.message || "Failed to fetch folders.";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const addFolder = useCallback(async (path) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.addFolder(path);
            if (response.success) {
                await fetchFolders();
                return { success: true, path: response.path };
            } else {
                setError(response.message || "Failed to add folder.");
                return { success: false, error: response.message };
            }
        } catch (err) {
            console.error("Failed to add folder:", err);
            const msg = err.response?.data?.message || err.message || "Failed to connect to server.";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [fetchFolders]);

    return {
        folders,
        loading,
        error,
        fetchFolders,
        addFolder
    };
}
