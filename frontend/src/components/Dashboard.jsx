import React, { useEffect, useState} from 'react';
import api from '../api';
import '../styles/Dashboard.css';
import { ACCESS_TOKEN } from '../token';

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

    useEffect(() => {
        const fetchUserData = async () => {
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
                const user = userResponse.data;
                setUserData(user);
                setIsAdmin(user.is_staff);

                // fetch orders
                await fetchOrders(currentPage)
            } catch (error) {
                console.error('Error fetching user data:', error);
                const errorMessage = error.response
                    ? error.response.data.detail || 'An error occurred while fetching user data'
                    : "An error occured: " + error.message
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

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
                ? error.response.data.detail || "An erro occured while fetching orders"
                : "An error occured: " + error.message
            setError(error.message);
        };
            
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchOrders(pageNumber)
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
            {/* Admin-specific features */}
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
