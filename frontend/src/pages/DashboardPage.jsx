
import { useState, useEffect, useRef, forwardRef } from 'react';
import api from "../api";
import NavBar from '../components/NavBar';
import SideBarDash from '../components/SideBarDash';
import "../styles/DashboardPage.css";
import GeographicDashboard from '../components/GeographicDashboard';
import ChartDashboard from '../components/ChartDashboard';
import ChatBotPage from '../components/ChatBotPage';
import NoDocument from '../components/NoDocument';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Chart } from 'chart.js';
import useBackend from '../hooks/useBackend';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

function DashboardPage() {
    const chatBoxRef = useRef(null);
    const geographicDashboardRef = useRef(null);
    const [activeSection, setActiveSection] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDocument, setIsDocument] = useState(false);

    const { messages, files, datas, status, sendMessage, handleUploadFile, loadSession } = useBackend();

    // Charger la session initiale lorsque la page se charge
    useEffect(() => {
        loadSession()
            .then(() => {
                if (chatBoxRef.current) {
                    chatBoxRef.current.setMessages(messages);
                }
                if (geographicDashboardRef.current) {
                    geographicDashboardRef.current.setDatas(datas);
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
        if (geographicDashboardRef.current) {
            geographicDashboardRef.current.setDatas(datas);
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

    const sections = [
        {
            id: "section-analyses",
            title: <h1>Geographic Analysis</h1>,
            content: <GeographicDashboard ref={geographicDashboardRef} />
        },
        {
            id: "section-relations-causales",
            title: <h1>Theme Comparison</h1>,
            content: <ChartDashboard />
        },
        {
            id: "section-predictions",
            title:<h1>AI Assistant</h1>,
            content: <ChatBotPage ref={chatBoxRef} handleSendMessage={handleSendMessage} handleUploadFile={handleUploadFile} loadSession={loadSession}/>
        }             
    ]
    const CustomInput = forwardRef(({ value, onClick }, ref) => (
        <button
          onClick={onClick}
          ref={ref}
          className="custom-input"
        >
            <CalendarMonthIcon className="calendar-icon" />
            {value}
        </button>
      ));

    return (
        <div className="dashboard-page">
            <div className="dashboard-layout">
                <SideBarDash setActiveSection={setActiveSection}/>
                <div className="content">
                        <div className="dashboard-content-header">
                            {isDocument ? sections[activeSection].title : <h1>Welcome Enedis !</h1>}
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
                            {isDocument ? sections[activeSection].content : <NoDocument handleUploadFile={handleUploadFile}/>}
                        </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
