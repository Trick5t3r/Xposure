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


function DashboardPage() {
    const chatBoxRef = useRef(null);
    const chartDashboardRef = useRef(null);
    const [activeSection, setActiveSection] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDocument, setIsDocument] = useState(false);

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
    }, [chatBoxRef.current]);

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
