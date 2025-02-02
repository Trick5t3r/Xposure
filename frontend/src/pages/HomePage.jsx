import {useState, useEffect} from 'react';
import api from "../api";
import NavBar from '../components/NavBar';
import "../styles/HomePage.css";

function HomePage() {
    const featuresCards = [
        {title: "Sentiment Analysis", description: "Understand the sentiment of your press coverage and identify positive and negative themes."},
        {title: "Key Themes", description: "Extract key themes from your press coverage to understand what topics are being discussed."},
        {title: "Comprehensive Reports", description: "Generate comprehensive reports that summarize the analysis of our models."},
        {title: "Ai Assistant", description: "Our AI assistant will guide you through the analysis by answering your questions and explaining the results."},
        {title: "Statistical Analysis", description: "Get detailed statistics on the sentiment, key themes and different media source of your press coverage."},
        {title: "Geographical Analysis", description: "Understand the geographical distribution of your press coverage and identify trends in different regions."}
    ]
    const teamCards1 = [
        {name: "Théo Le Pendeven", role: "Software Engineer", description: "Theo designed the backend architecture of our solution and monitored the integration process.", ImageUrl: "/imgs/theo.jpg", linkedin: "https://www.linkedin.com/in/th%C3%A9o-le-pendeven-038067247?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B%2FhDCfsJoSCejHCuet14owg%3D%3D"},
        {name: "Paul Le Van Kiem", role: "Software Engineer", description: "Paul designed the React application and helped integrate the different models to our solution.", ImageUrl: "/imgs/lvk.jpg", linkedin: "https://www.linkedin.com/in/paul-le-van-kiem-000246256?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BcQT0dANBSgG3xvsvu81uyg%3D%3D"},
        {name: "Yessin Moakher", role: "LLM Engineer", description: "Yessin Moakher participated in the development of our LLM model for sentiment analysis and integrated RAG pipeline.", ImageUrl: "/imgs/yessin.jpg", linkedin: "https://www.linkedin.com/in/yessin-moakher-600a54246?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B3YMB7Hx1QwyRrdcg51M1yA%3D%3D"},
    ];
    const teamCards2 = [
        {name: "David Kerriou", role: "AI Scientist", description: "David tested smaller models fine-tuning to perform sentiment analysis classification.", ImageUrl: "/imgs/david.jpg", linkedin: "https://www.linkedin.com/in/david-kerriou-75a939293?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BSyuXDFhJTaWSNHwkD%2Bxn1w%3D%3D"},
        {name: "Colas Lepoutre", role: "LLM Engineer", description: "Colas helped develop the LLM model for the main task, and worked on the PDF processing.", ImageUrl: "/imgs/colas.jpg", linkedin: "https://www.linkedin.com/in/colas-lepoutre/overlay/contact-info/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BfbtZuTv8TpGyY8ohb9aJ0Q%3D%3D"},
        // {name: "Baptiste Barthe-Gold", role: "Motivational Coach", description: "", ImageUrl: "/imgs/barthe.PNG", linkedin: "https://www.linkedin.com/in/baptiste-barthe-gold?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BqT2fg3a1TaaCwE93upDDEw%3D%3D"}
    ];
    const handleRedirect = (link) => {
        window.open(link, "_blank");
    };
    return <div className='home-page'>
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
                    {featuresCards.map((card, index) => {
                        return <div key={index} className="home-middle-page-card">
                            <div className="home-middle-page-card-container">
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                            </div>
                        </div>
                    })}
                </div>
                <div id="target" className="separator"></div>
                <div className="home-about-us">
                    <h3>About Us</h3>
                    <div className="home-about-us-wrapper">
                        {teamCards1.map((card, index) => {
                            return <div key={index} className="home-about-us-card">
                                <div className="home-about-us-card-container" onClick={() => handleRedirect(card.linkedin)}>
                                    <img src={card.ImageUrl} alt={card.name} className="home-photo" />
                                    <h4>{card.name}</h4>
                                    <p className='home-role'>{card.role}</p>
                                    <p>{card.description}</p>
                                </div>
                            </div>
                        })}
                    </div>
                    <div className="home-about-us-wrapper">
                        {teamCards2.map((card, index) => {
                            return <div key={index} className="home-about-us-card">
                                <div className="home-about-us-card-container" onClick={() => handleRedirect(card.linkedin)}>
                                    <img src={card.ImageUrl} alt={card.name} className="home-photo" />
                                    <h4>{card.name}</h4>
                                    <p className='home-role'>{card.role}</p>
                                    <p>{card.description}</p>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </div>
}

export default HomePage;