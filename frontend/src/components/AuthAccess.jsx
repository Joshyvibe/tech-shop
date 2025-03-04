import React from "react";
import { Navigate } from "react-router-dom";    
import { useAuth } from "../auth";  


function ProtectedRoute({children}) {
    const {isAuthorized} = useAuth();

    if (isAuthorized === null) {
        return <div>Loading...........</div>
    }

    if (
        isAuthorized &&
        (window.location.pathname === "/login" || window.location.pathname === "/register")
    ) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;