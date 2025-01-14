import { useState, useEffect, useRef } from 'react';
import api from "../api";
import NavBar from '../components/NavBar';
import SideBarDash from '../components/SideBarDash';
import "../styles/DashboardPage.css";
import ChartDashboard from '../components/ChartDashboard';
import ChatSidebar from '../components/ChatSidebar';

function DashboardPage() {
    const chatBoxRef = useRef(null);
    const chartDashboardRef = useRef(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            api.get(`/api/chatsessions/`)
                .then((res) => res.data)
                .then((data) => {
                    if (chatBoxRef.current) {
                        chatBoxRef.current.setMessages(data.messages);
                    }
                    if(chartDashboardRef.current){
                        chartDashboardRef.current.setDatas(data.datas)
                    }
                })
                .catch((err) => alert("Error loading session messages: " + err));
        }
    }, []);

    const handleSendMessage = (input) => {
        const newMessage = { role: "user", content: input.message, context: { files: input.files } };

        if (chatBoxRef.current) {
            chatBoxRef.current.setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        api.patch(`/api/chatsessions/`, {
            messages: [newMessage],
        })
            .then((res) => {
                if (res.status === 200) {
                    return api.get(`/api/chatsessions/`);
                } else {
                    throw new Error("Failed to update the session.");
                }
            })
            .then((res) => res.data)
            .then((data) => {
                if (chatBoxRef.current) {
                    chatBoxRef.current.setMessages(data.messages);
                }
                if(chartDashboardRef.current){
                    chartDashboardRef.current.setDatas(data.datas)
                }
            })
            .catch((err) => {
                alert("Error updating the session: " + err);
                if (chatBoxRef.current) {
                    chatBoxRef.current.setMessages((prevMessages) =>
                        prevMessages.filter((msg) => msg !== newMessage)
                    );
                }
            });
    };

    const handleUploadFile = (file) => {
        const formData = new FormData();
        formData.append("file", file);
        //formData.append("sessionid", currentSession);

        const fileExtension = file.name.split('.').pop().toLowerCase();
        const resourceType = ["png", "jpg", "jpeg", "bmp", "tiff"].includes(fileExtension)
            ? "ImageFile"
            : fileExtension === "pdf"
            ? "PDFFile"
            : "OtherFile";

        formData.append("resourcetype", resourceType);

        return api.post(`/api/fileupload/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then((res) => {
                if (res.status === 201) {
                    return res.data;
                } else {
                    throw new Error("Failed to upload file.");
                }
            })
            .catch((err) => {
                alert("Error uploading file: " + err.message);
                throw err;
            });
    };

    return (
        <div className="dashboard-page">
            <NavBar />
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
