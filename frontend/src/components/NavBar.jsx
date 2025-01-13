import "../styles/NavBar.css";
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import { REFRESH_TOKEN, ACCESS_TOKEN, USERNAME } from "../constants";
import { jwtDecode } from "jwt-decode"; // Import corrigé

function NavBar() {
    // Définition des constantes et des différents éléments du menu de navigation
    const CompanyTitle = "Xposure";
    const navigate = useNavigate();
    const handleScroll = () => {
        const element = document.getElementById('target');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const navBarcontent = [
        {name: "Dashboard", route: "/dashboard"},
        {name: "GitHub"},
        {name: "About us"}
    ];

    // Vérifie si le user est bien log pour afficher le menu hamburger ou non
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post('/api/token/refresh/', {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                const decoded = jwtDecode(res.data.access); // Décoder le nouveau token
                localStorage.setItem(USERNAME, decoded.username)
                setIsAuthorized(true);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            localStorage.setItem(USERNAME, decoded.username)
            setIsAuthorized(true);
        }
    };

    // Fonctions pour afficher le menu hamburger ou le bouton de login
    const displayButton = () => {
        return (
            <div className="nav-bar-button-container">
                <button className="nav-bar-secondary-button" onClick={() => navigate("/login")}>Login</button>
                {/* <button className="nav-bar-primary-button">Get started</button> */}
            </div>
        );
    }

    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen); // Alterne entre ouvert et fermé
    };

    const handleLogout = () => {
        setTimeout(() => {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            localStorage.removeItem(USERNAME);
            setIsAuthorized(false);
            window.location.reload(); // Recharge la page après 1s
        }, 100); // 1 seconde d'attente
    }

    const displayHamburgerMenu = () => {
        return (
            <>
            <div className="nav-bar-button-container" style={{visibility: "hidden"}}>
                <button className="nav-bar-secondary-button" onClick={() => navigate("/login")}>Login</button>
                {/* <button className="nav-bar-primary-button">Get started</button> */}
            </div>
            <div className={`nav-bar-menu ${isOpen ? "active" : ""}`}>
                <div className={`nav-bar-hamburger-menu ${isOpen ? "active" : ""}`} onClick={toggleMenu}>
                    <div className="nav-bar-hamburger-menu-line"></div>
                    <div className="nav-bar-hamburger-menu-line"></div>
                    <div className="nav-bar-hamburger-menu-line"></div>
                </div>
                <div className="nav-bar-menu-content">
                    <img src="/imgs/colas.jpg" alt="Photo" className="nav-bar-user-photo" />
                    <p>La grosse poutre</p>
                    <button onClick={handleLogout}>⏻ Logout</button>
                </div>
            </div>
            </>
        );
    }

    // Affichage du composant NavBar
    return <div className="nav-bar">
        <span className="nav-bar-logo" onClick={() => navigate("/")}>{CompanyTitle}</span>
        <div className="nav-bar-p">
            {navBarcontent.map((item, index) => {
                if (item.name === "Dashboard") {
                    return <p key={index} onClick={() => navigate(item.route)}>{item.name}</p>
                } else if (item.name === "About us") {
                    return <p key={index} onClick={handleScroll}>{item.name}</p>
                } else {
                    return <p key={index}><a href="https://github.com/Trick5t3r/Xposure" target="_blank" rel="noopener noreferrer">{item.name}</a></p>
                }
            })}
        </div>
        {isAuthorized ? displayHamburgerMenu() : displayButton()}
        {/* <form><div className="nav-bar-input-wrapper"><span className="nav-bar-search-logo">&#128269;</span><input className="nav-bar-search" type="text" placeholder="Search" /></div></form> */}
    </div>
}

export default NavBar;