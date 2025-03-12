import api from "../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GOOGLE_ACCESS_TOKEN } from "../token";
import "../styles/AuthForm.css";
import google from "../assets/google.png";
import { useAuth } from "../auth";

const AuthForm = ({ route, method }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    
    // Replace useAuthentication with useAuth
    const { login, isAuthorized } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (method === "login") {
                // Use the login method from AuthContext
                const success = await login({ username, password });
                
                if (success) {
                    navigate("/dashboard", { replace: true });
                } else {
                    setError("Login failed. Please check your credentials.");
                }
            } else {
                // Registration logic
                const res = await api.post(route, { username, password });
                setSuccess("Registration successful. Please login.");
                setTimeout(() => navigate("/login", { replace: true }), 2000);
            }
        } catch (error) {
            console.error(error);
            if (error.response) {
                if (error.response.status === 401) {
                    setError("Invalid credentials");
                } else if (error.response.status === 400) {
                    setError("Username already exists");
                } else {
                    setError("Something went wrong. Please try again.");
                }
            } else if (error.request) {
                setError("Network error. Please check your internet connection.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:8000/accounts/google/login/";
    };

    useEffect(() => {
        const handleGoogleCallback = async () => {
            // Check if we are on the callback page
            if (window.location.pathname === '/google-callback') {
                // Extract the token from URL query params
                const params = new URLSearchParams(window.location.search);
                const googleToken = params.get("access_token");

                if (googleToken) {
                    localStorage.setItem(GOOGLE_ACCESS_TOKEN, googleToken);
                    
                    // Validate the token through the AuthContext
                    await login({ google_token: googleToken });
                    navigate("/dashboard", { replace: true });
                }
            }
        };

        handleGoogleCallback();
    }, [navigate, login]);


    return (
        <div className="form-container">
            {loading && (
                <div className="loading-indicator">
                    {error ? <span className="error-message">{error}</span> : <div className="spinner"></div>}
                </div>
            )}
            {!loading && (
                <form onSubmit={handleSubmit} className="form">
                    <h2>{method === "register" ? "Register" : "Login"}</h2>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="form-button">
                        {method === "register" ? "Register" : "Login"}
                    </button>
                    <button type="button" className="google-button" onClick={handleGoogleLogin}>
                        <img src={google} alt="Google icon" className="google-icon" />
                        {method === "register" ? "Register with Google" : "Login with Google"}
                    </button>
                    {method === "login" && (
                        <p className="toggle-text">
                            Don't have an account?
                            <span className="toggle-link" onClick={() => navigate("/register")}>
                                Register
                            </span>
                        </p>
                    )}
                    {method === "register" && (
                        <p className="toggle-text">
                            Already have an account?
                            <span className="toggle-link" onClick={() => navigate("/login")}>
                                Login
                            </span>
                        </p>
                    )}
                </form>
            )}
        </div>
    );
};
   
export default AuthForm;
