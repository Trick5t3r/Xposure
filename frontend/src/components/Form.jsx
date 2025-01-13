import {useState} from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({route, method}) {
    const CompanyTitle = "Xposure";
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();
    const name = method === "login" ? "Login" : "Create An Account";
    const buttonText = method === "login" ? "Login" : "Sign Up";

    const togglePassword = () => {
        setPasswordVisible(!passwordVisible);
    }

    const handleNavigation = (e) => {
        e.preventDefault();
        if (method === "login") navigate("/register");
        else navigate("/login");
      };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password});
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            console.log("Ah merde !")
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    return <div className="form-page">
                <div className="form-wrapper">
                        <div className="form-header"><span className="form-logo" onClick={() => navigate("/")}>{CompanyTitle}</span></div>
                        <form onSubmit={handleSubmit} className="form-container">
                        <h1>{name}</h1>
                        <p>Username</p>
                        <input 
                            className="form-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Kewij" 
                        />
                        <p>Password</p>
                        <div className="form-div-input">
                        <input 
                            className="password-input"
                            type={passwordVisible ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Choose your password" 
                        />
                        <span
                            className="toggle-password"
                            onClick={togglePassword}
                            role="button"
                            aria-label="Toggle password visibility"
                        >{passwordVisible ? "🙈" : "👁️"}</span>
                        </div>
                        {loading && <LoadingIndicator />}
                        <button className="form-button" type="submit">
                            {buttonText}
                        </button>
                        <div className="end-wrapper">
                            <h2 className="end-sentence">{method === "login" ? "Want to create an account ?" : "Already registered ?"}</h2>
                            <button className="navigate" onClick={handleNavigation}>{method === "login" ? "Sign Up" : "Login"}</button>
                        </div>
                    </form>
            </div>
        </div>
    
    
}

export default Form;
