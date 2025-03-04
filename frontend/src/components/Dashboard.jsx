import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';
import '../styles/Dashboard.css';
import { ACCESS_TOKEN } from '../token';
import { useAuth } from '../auth';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([])
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    //pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5);
    const [totalOrders, setTotalOrders] = useState(0)

    // Use the AuthContext
    const { isAuthorized, user, logout } = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            // If not authorized, stop loading
            if (!isAuthorized) {
                setLoading(false);
                return;
            }

            try {
                const accessToken = localStorage.getItem(ACCESS_TOKEN);
                if (!accessToken) {
                    throw new Error('No access token found');
                }

                const headers = {
                    Authorization: `Bearer ${accessToken}`,
                }

                // fetch the user data
                const userResponse = await api.get('/dashboard/', {headers})
                const userData = userResponse.data;
                setUserData(userData);
                setIsAdmin(userData.is_staff);

                // fetch orders
                await fetchOrders(currentPage)
            } catch (error) {
                console.error('Error fetching user data:', error);
                const errorMessage = error.response
                    ? error.response.data.detail || 'An error occurred while fetching user data'
                    : "An error occured: " + error.message
                setError(error.message);
                
                // If token is invalid, logout
                if (error.response && error.response.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [isAuthorized, currentPage]);

    const fetchOrders = async (page) => {
        try {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            const headers = {
                Authorization: `Bearer ${accessToken}`,
            }
            const ordersResponse = await api.get(`/api/user_view_orders/?page=${page}`, { headers})
            console.log("order response", ordersResponse)

            setOrders(ordersResponse.data.results);
            setTotalOrders(ordersResponse.data.count);
        } catch (error) {
            console.error('Error fetching orders:', error);
            const errorMessage = error.response
                ? error.response.data.detail || "An error occurred while fetching orders"
                : "An error occurred: " + error.message
            setError(error.message);
        }
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchOrders(pageNumber)
    }

    // If not authorized, redirect to login
    if (!isAuthorized) {
        return <Navigate to="/login" replace />;
    }

    // set loading or error handling
    if (loading) return <p>Loading ....</p>
    if (error) return <p className='error-message'>{error}</p>
    
    // set up function to render user data
    const renderUserData = () => (
        <div>
            <h2>Welcome, {userData.username}!</h2>
            {isAdmin && <p>You are an admin.</p>}
            <p>Status: {userData.is_active ? "Active" : 'Inactive'}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );

    const renderOrders = () => (
        <div>
            <h3>Orders</h3>
            {orders.length > 0 ? (
                <ul>
                    {orders.map((order) => (
                        <li key={order.id}>
                            Order # {order.id} - {order.status} - Total: ${order.total_price}
                            - by {order.user.username}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No orders found.</p>
            )}
            <div className='pagination'>
                {totalOrders > ordersPerPage && (
                    Array.from({ length: Math.ceil(totalOrders / ordersPerPage)}, (_, index) => (
                        <button 
                            key={index + 1} 
                            onClick={() => paginate(index + 1)}
                            disabled={currentPage === index + 1}
                        >
                            {index + 1}
                        </button>
                    ))
                )}
            </div>
        </div>
    );

    const renderAdminFeatures = () => (
        <div>
            <h3>Admin Features</h3>
            <div className='admin-actions'>
                <button onClick={() => window.location.href = "/api/products"}>Manage Products</button>
            </div>
        </div>
    )

    return (
        <div className='dashboard'>
            <h1>Dashboard</h1>
            {renderUserData()}
            {isAdmin && renderAdminFeatures()}
            {renderOrders()}
        </div>
    )
}
export default Dashboard;