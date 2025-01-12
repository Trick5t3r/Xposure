import {useState, useEffect} from 'react';
import api from "../api";
import NavBar from '../components/NavBar';
import "../styles/HomePage.css";

function HomePage() {
    const featuresCards = [
        {title: "Sentiment Analysis", description: "Understand the sentiment of your press coverage and identify positive and negative themes."},
        {title: "Key Themes", description: "Extract key themes from your press coverage to understand what topics are being discussed."},
        {title: "Comprehensive Reports", description: "Generate comprehensive reports that summarize the sentiment and key themes of your press coverage."}
    ]
    const teamCards = [
        {name: "John Doe", role: "CEO", description: "John is the CEO of our company and has over 10 years of experience in the industry."},
        {name: "Jane Doe", role: "CTO", description: "Jane is the CTO of our company and is an expert in artificial intelligence and machine learning."},
        {name: "John Doe", role: "CEO", description: "John is the CEO of our company and has over 10 years of experience in the industry."},
        {name: "Jane Doe", role: "CTO", description: "Jane is the CTO of our company and is an expert in artificial intelligence and machine learning."},
        {name: "John Doe", role: "CEO", description: "John is the CEO of our company and has over 10 years of experience in the industry."},
        {name: "Jane Doe", role: "CTO", description: "Jane is the CTO of our company and is an expert in artificial intelligence and machine learning."}
    ]
    return <>
            <div className="home-top-page">
                <NavBar />
                <div className="home-top-page-content">
                    <h1>Transform Press Coverage</h1>
                    <br />
                    <h2>Into Actionable <span>Insights</span></h2>
                    <p>Upload your press articles and let our AI analyze sentiment, extract key themes, and generate comprehensive reports in seconds.</p>
                    <div className="home-button-container">
                        {/* <button className="home-primary-button">Upload files</button>
                        <button className="home-secondary-button">► Generate report</button> */}
                    </div>
                </div>
            </div>
            <div className="home-middle-page">
                <div className="home-middle-page-wrapper">
                    {featuresCards.map((card) => {
                        return <div className="home-middle-page-card">
                            <div className="home-middle-page-card-container">
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                            </div>
                        </div>
                    })}
                </div>
                <div className="home-about-us">
                    <h3>About Us</h3>
                    <div className="home-about-us-wrapper">
                        {teamCards.map((card) => {
                            return <div className="home-about-us-card">
                                <div className="home-about-us-card-container">
                                    <h4>{card.name}</h4>
                                    <p>{card.role}</p>
                                    <p>{card.description}</p>
                                </div>
                            </div>
                        })}

                    </div>
                </div>
            </div>
        </>
}

export default HomePage;