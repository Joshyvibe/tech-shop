import React from "react";
import {Link} from "react-router-dom";
import logo from "../assets/logo.png";
import '../styles/Navbar.css';
import { useAuth } from "../auth";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";


function Navbar() {
    
    const navigate = useNavigate();

    const {isAuthorized, logout} = useAuth();
    const { state } = useCart();
    const cart = state.cart || [];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="navbar">
            <Link to="/" className="navbar-logo-link">
                <img src={logo} alt="Logo" className="navbar-logo"/>
            </Link>
            <ul className="navbar-menu-left">
                <li>
                    <Link to="/why">Why Us?</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/contact">Contact</Link>
                </li>
            </ul>
            <ul className="navbar-menu-right">
                {isAuthorized ? (
                    <>
                        <li className="dashboard-icon">
                            <Link to="/dashboard">DB</Link>
                        </li>
                        <li className="cart-icon">
                            <Link to="/cart">
                                <span className="cart-count">{cart.length}</span>
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="button-link">Logout</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/login" className="button-link-login">Log In</Link>
                        </li>
                        <li>
                            <Link to="/register" className="button-link">Register</Link>
                        </li>
                    </>
                )}
                
               
            </ul>
        </div>
    );
}

export default Navbar;