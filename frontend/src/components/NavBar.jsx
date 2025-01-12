import "../styles/NavBar.css";

function NavBar() {
    const CompanyTitle = "Xposure";

    const navBarcontent = [
        {name: "Features"},
        {name: "GitHub"},
        {name: "About us"}
    ];

    return <div className="nav-bar">
        <span className="nav-bar-logo">{CompanyTitle}</span>
        <div className="nav-bar-p">
            {navBarcontent.map((item, index) => {
                return <p key={index}>{item.name}</p>
            })}
        </div>
        {/* <form><div className="nav-bar-input-wrapper"><span className="nav-bar-search-logo">&#128269;</span><input className="nav-bar-search" type="text" placeholder="Search" /></div></form> */}
        <div className="nav-bar-button-container">
            <button className="nav-bar-secondary-button">Login</button>
            <button className="nav-bar-primary-button">Get started</button>
        </div>
    </div>

}

export default NavBar;