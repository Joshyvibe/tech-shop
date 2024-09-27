import React from "react";
import { Navigate } from "react-router-dom";    
import { useAuthentication } from "../auth";    


function ProtectedRoute({children}) {
    const {isAuthorized} = useAuthentication();

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