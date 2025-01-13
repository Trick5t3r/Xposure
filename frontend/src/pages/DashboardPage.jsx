import {useState, useEffect} from 'react';
import api from "../api";
import NavBar from '../components/NavBar';
import SideBarDash from '../components/SideBarDash';
import "../styles/DashboardPage.css";
import ChartDashboard from '../components/ChartDashboard';
import ChatSidebar from '../components/ChatSidebar';

function DashboardPage() {      
    return (
        <div className="dashboard-page">
            <NavBar />
            <div className="dashboard-layout">
                <SideBarDash />
                <div className="content">
                    <div id="section-analyses">
                        <h1>Analyses</h1>
                        <ChartDashboard />
                    </div>
                    <div id="section-relations-causales">
                        <h1>Relations Causales</h1>
                    </div>
                    <div id="section-predictions">
                        <h1>Prédictions</h1>
                    </div>
                </div>
                <ChatSidebar />
            </div>
        </div>
    );
}

export default DashboardPage;
