import { useState, useEffect, useRef, forwardRef } from 'react';
import api from "../api";
import SideBarDash from '../components/SideBarDash';
import "../styles/DashboardPage.css";
import GeographicDashboard from '../components/GeographicDashboard';
import ChartDashboard from '../components/ChartDashboard';
import ChatBotPage from '../components/ChatBotPage';
import NoDocument from '../components/NoDocument';
import FileManagement from '../components/FileManagement';
import PdfGeneration from '../components/PdfGeneration';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useBackend from '../hooks/useBackend';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

function DashboardPage() {
    const chatBoxRef = useRef(null);
    const geographicDashboardRef = useRef(null);
    const [activeSection, setActiveSection] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDashboardRegion, setSelectedDashboardRegion] = useState(null);
    const [isDocument, setIsDocument] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const { messages, files, datas, status, sendMessage, handleUploadFile, loadSession, loadResultFile } = useBackend();
    const [listFiles, setListFiles] = useState([]);

    useEffect(() => {
        getListFiles();
    }, [refresh]);

    const getListFiles = () => {
        api
        .get("/api/fileupload/")
        .then((res) => res.data)
        .then((data) => {setListFiles(data)})
        .catch((err) => alert(err));
    };

    const fileExists = listFiles.some(file => {
        const fileDate = new Date(file.date);
        const selectedDateObj = selectedDate;
        const boolDate = (fileDate.getFullYear() === selectedDateObj.getFullYear() && fileDate.getMonth() === selectedDateObj.getMonth());
        if ((!selectedDashboardRegion) || (selectedDashboardRegion === 'all')) {
            return boolDate && (file.region == -1);
        } else {
            return boolDate && (file.region == selectedDashboardRegion);
        }      
    });

    useEffect(() => {
        if (fileExists) {
            setIsDocument(true);
        } else {
            setIsDocument(false);
        }
    }, [listFiles, selectedDate, selectedDashboardRegion]);
    
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
    }, [messages, datas]);

    const handleSendMessage = (input) => {
        const newMessage = { role: "user", content: input.message, context: { files: input.files, date:selectedDate.toISOString().slice(0, 7), region:((selectedDashboardRegion === "all") || !(selectedDashboardRegion)) ? -1 : selectedDashboardRegion } };
        // Mettre à jour localement les messages dans ChatSidebar
        if (chatBoxRef.current) {
            chatBoxRef.current.setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        // Envoyer le message via WebSocket
        sendMessage(newMessage);
    };

    const sections = [
        {
            id: "section-file-management",
            title: <h1>Welcome Enedis !</h1>,
            content: <FileManagement handleUploadFile={handleUploadFile} setRefresh={setRefresh} selectedDate={selectedDate} selectedDashboardRegion={selectedDashboardRegion}/>
        },    
        {
            id: "section-analyses",
            title: <h1>Geographical Analysis</h1>,
            content: <GeographicDashboard loadSession={loadSession} selectedDashboardRegion={selectedDashboardRegion} selectedDate={selectedDate} loadResultFile={loadResultFile}/>
        },
        {
            id: "section-relations-causales",
            title: <h1>General Statistics</h1>,
            content: <ChartDashboard selectedDashboardRegion={selectedDashboardRegion} selectedDate={selectedDate} loadResultFile={loadResultFile}/>
        },
        {
            id: "section-predictions",
            title:<h1>AI Assistant</h1>,
            content: <ChatBotPage ref={chatBoxRef} handleSendMessage={handleSendMessage} handleUploadFile={handleUploadFile} loadSession={loadSession}/>
        },
        {
            id: "section-pdf-generation",
            title: <h1>Report Generation</h1>,
            content: <PdfGeneration selectedDashboardRegion={selectedDashboardRegion} selectedDate={selectedDate} loadResultFile={loadResultFile}/>
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
                <SideBarDash setActiveSection={setActiveSection} setSelectedDashboardRegion={setSelectedDashboardRegion}/>
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
                            {(isDocument || activeSection === 0) ? sections[activeSection].content : <NoDocument handleUploadFile={(e) => {
                                handleUploadFile({e, selectedDate, selectedDashboardRegion});
                                setTimeout(() => {
                                    setRefresh(prev => !prev);
                                }, 1000);
                                }}
                                />}
                        </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
