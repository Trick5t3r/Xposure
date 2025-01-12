import {useState, useEffect} from 'react';
import api from "../api";
import NavBar from '../components/NavBar';
import SideBarDash from '../components/SideBarDash';
import "../styles/DashboardPage.css";
import ChartDashboard from '../components/ChartDashboard';
import FranceMap from '../components/FranceMap';

function DashboardPage() {      
    return (
        <div className="dashboard-page">
            <NavBar />
            <div className="dashboard-layout">
                <SideBarDash />
                <div className="content">
                    <div>
                        <h1>France</h1>
                        <FranceMap />
                    </div>
                    <div>
                        <h1>Graphiques</h1>
                        <ChartDashboard />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
