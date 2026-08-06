import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export const getFolders = async () => {
    const response = await api.get("/folders/");
    return response.data;
};

export const addFolder = async (path) => {
    const response = await api.post("/folders/", { path });
    return response.data;
};

export const askQuestion = async (question) => {
    const response = await api.post("/chat/", { question });
    return response.data;
};

export const previewFile = async (path) => {
    const response = await api.get("/folders/preview", { params: { path } });
    return response.data;
};

export const getHistory = async () => {
    const response = await api.get("/history/");
    return response.data;
};

export const saveHistory = async (query) => {
    const response = await api.post("/history/", { query });
    return response.data;
};

export const deleteHistory = async (id) => {
    const response = await api.delete(`/history/${id}`);
    return response.data;
};

export const clearHistory = async () => {
    const response = await api.delete("/history/");
    return response.data;
};

export default {
    getFolders,
    addFolder,
    askQuestion,
    previewFile,
    getHistory,
    saveHistory,
    deleteHistory,
    clearHistory
};
