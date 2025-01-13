import "../styles/NavBar.css";
import {useNavigate} from "react-router-dom";

function NavBar() {
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
        {/* <form><div className="nav-bar-input-wrapper"><span className="nav-bar-search-logo">&#128269;</span><input className="nav-bar-search" type="text" placeholder="Search" /></div></form> */}
        <div className="nav-bar-button-container">
            <button className="nav-bar-secondary-button" onClick={() => navigate("/login")}>Login</button>
            {/* <button className="nav-bar-primary-button">Get started</button> */}
        </div>
    </div>

}

export default NavBar;