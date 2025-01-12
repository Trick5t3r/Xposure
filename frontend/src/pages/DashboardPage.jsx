import {useState, useEffect} from 'react';
import api from "../api";
import NavBar from '../components/NavBar';
import SideBarDash from '../components/SideBarDash';
import "../styles/DashboardPage.css";
import ChartDashboard from '../components/ChartDashboard';

function DashboardPage() {
    return (
        <div className="dashboard-page">
            <NavBar />
            <div className="dashboard-layout">
                <SideBarDash />
                <div className="content">
                    <h1>Home Page</h1>
                    <ChartDashboard />
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
