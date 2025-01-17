import { useState, useEffect, useRef } from 'react';
import SideBarDash from '../components/SideBarDash';
import "../styles/DashboardPage.css";
import ChartDashboard from '../components/ChartDashboard';
import ChatSidebar from '../components/ChatSidebar';
import useBackend from '../hooks/useBackend';

function DashboardPage() {
    const chatBoxRef = useRef(null);
    const chartDashboardRef = useRef(null);

    const { messages, datas, status, sendMessage, uploadFile, loadSession } = useBackend();


    // Charger la session initiale lorsque la page se charge
    useEffect(() => {
        loadSession()
            .then(() => {
                if (chatBoxRef.current) {
                    chatBoxRef.current.setMessages(messages);
                }
                if (chartDashboardRef.current) {
                    chartDashboardRef.current.setDatas(datas);
                }
            })
            .catch((err) => {
                alert("Error loading session messages: " + err);
            });
    }, []);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.setMessages(messages);
        }
        if (chartDashboardRef.current) {
            chartDashboardRef.current.setDatas(datas);
        }
    }, [messages, datas]);

    const handleSendMessage = (input) => {
        const newMessage = { role: "user", content: input.message, context: { files: input.files } };

        // Mettre à jour localement les messages dans ChatSidebar
        if (chatBoxRef.current) {
            chatBoxRef.current.setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        // Envoyer le message via WebSocket
        sendMessage(newMessage);
    };

    // Gestion de l'upload des fichiers
    const handleUploadFile = async (file) => {
        try {
            const uploadedFile = await uploadFile(file);
            console.log("File uploaded successfully:", uploadedFile);
        } catch (error) {
            alert("Error uploading file: " + error.message);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-layout">
                <SideBarDash />
                <div className="content">
                    <div id="section-analyses">
                        <h1>Analyses</h1>
                        <ChartDashboard ref={chartDashboardRef}/>
                    </div>
                    <div id="section-relations-causales">
                        <h1>Relations Causales</h1>
                    </div>
                    <div id="section-predictions">
                        <h1>Prédictions</h1>
                    </div>
                </div>
                <ChatSidebar
                    ref={chatBoxRef}
                    handleSendMessage={handleSendMessage}
                    handleUploadFile={handleUploadFile}
                />
            </div>
        </div>
    );
}

export default DashboardPage;
