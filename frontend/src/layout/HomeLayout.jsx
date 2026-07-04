import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import Chat from "../components/Chat/Chat";
import SourcesPanel from "../components/Sources/SourcesPanel";
import AddFolderModal from "../components/Sidebar/AddFolderModal";
import { useFolders } from "../hooks/useFolders";
import { useChat } from "../hooks/useChat";

function HomeLayout() {
    const { 
        folders, 
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

    const [activeFolder, setActiveFolder] = useState(null);
    const [showSources, setShowSources] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Fetch watched folders on mount and evaluate backend availability
    useEffect(() => {
        const init = async () => {
            const res = await fetchFolders();
            if (!res.success) {
                setBackendConnected(false);
            } else {
                setBackendConnected(true);
            }
        };
        init();
    }, [fetchFolders, setBackendConnected]);

    const handleFolderAdded = () => {
        fetchFolders();
    };

    const handleSendMessage = async (text) => {
        const res = await sendMessage(text);
        if (res.success && res.sources && res.sources.length > 0) {
            setShowSources(true); // Auto-open sources for a premium UX
        }
    };

    return (
        <div className="layout">
            <Sidebar
                folders={folders}
                activeFolder={activeFolder}
                setActiveFolder={setActiveFolder}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
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
                    />

                    <SourcesPanel
                        isOpen={showSources}
                        onClose={() => setShowSources(false)}
                        sources={currentSources}
                    />
                </div>
            </div>

            <AddFolderModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onFolderAdded={handleFolderAdded}
            />
        </div>
    );
}

export default HomeLayout;