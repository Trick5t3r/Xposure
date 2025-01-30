
import { useState, useEffect, useRef, forwardRef } from 'react';
import api from "../api";
import NavBar from '../components/NavBar';
import SideBarDash from '../components/SideBarDash';
import "../styles/DashboardPage.css";
import ChartDashboard from '../components/ChartDashboard';
import ChatSidebar from '../components/ChatSidebar';
import NoDocument from '../components/NoDocument';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Chart } from 'chart.js';
import useBackend from '../hooks/useBackend';

function DashboardPage() {
    const chatBoxRef = useRef(null);
    const chartDashboardRef = useRef(null);
    const [activeSection, setActiveSection] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDocument, setIsDocument] = useState(false);

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

    const sections = [
        {
            id: "section-analyses",
            title: <h1>Analyses</h1>,
            content: <ChartDashboard ref={chartDashboardRef} />
        },
        {
            id: "section-relations-causales",
            title: <h1>Relations Causales</h1>,
            content: <ChartDashboard ref={chartDashboardRef} />
        },
        {
            id: "section-predictions",
            title:<h1>Prédictions</h1>,
            content: <ChartDashboard ref={chartDashboardRef} />
        }             
    ]
    const CustomInput = forwardRef(({ value, onClick }, ref) => (
        <button
          onClick={onClick}
          ref={ref}
          className="custom-input"
        >
          {value}
        </button>
      ));

    return (
        <div className="dashboard-page">
            <div className="dashboard-layout">
                <SideBarDash setActiveSection={setActiveSection}/>
                <div className="content">
                        <div className="dashboard-content-header">
                            {sections[activeSection].title}
                            <div className='dashboard-content-header-right'>
                                <div className="datepicker-container">
                                    {/* DatePicker avec input personnalisé */}
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date) => setSelectedDate(date)}
                                        dateFormat="MMMM yyyy" // Affichage du mois en toutes lettres
                                        showMonthYearPicker
                                        customInput={<CustomInput />} // On remplace l'input par notre bouton stylisé
                                    />
                                </div>
                                {/* <button className="upload-button">
                                    <CloudUploadOutlinedIcon className="upload-icon" />
                                    <p>Upload Document</p>
                                </button> */}
                                <div className="user-box">
                                    <img src="/imgs/enedis-notre-histoire.jpg" alt="enedis" className="user-photo" />
                                    <p>Enedis</p>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-content-content">
                            {isDocument ? sections[activeSection].content : <NoDocument />}
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
