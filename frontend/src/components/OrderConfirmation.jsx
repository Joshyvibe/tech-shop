import React, {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe} from '@stripe/stripe-js';
import {Elements, CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import api from "../api";
import '../styles/OrderConfirmation.css';

// load the stripe pub key

const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY

const stripePromise = loadStripe(STRIPE_PUB_KEY)

const PaymentForm = ({clientSecret, orderId, orderDetails}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) return;

        const card = elements.getElement(CardElement);

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: orderDetails?.user.username || "Customer Paying" // fallabck
                },
            },

        })

        if (result.error) {
            setError(result.error.message);
            setLoading(false);
        } else {
            if (result.paymentIntent.status ==='succeeded') {
                const paymentId= result.paymentIntent.id; // extract payment id

                // mark the order as paid with the payment id
                await api.post(`/api/orders/${orderId}/mark_paid/`, {
                    payment_id: paymentId, // send payment id to the back end
                })

                setPaymentSuccess(true);
            }
            setLoading(false);
        }
        
    };

    useEffect(() => {
        if (paymentSuccess) {
            setTimeout(() => {
                navigate(`/reviews/${orderId}`);
            }, 3000) //wait for 3 seconds before redirecting us to the review page
        }
    }, [paymentSuccess, navigate, orderId]);

    return (
        <div className="payment-form">
            {paymentSuccess ? (
                <h3 className="success-message">Payment Sucessful! Your order is confirmed..</h3>
            ) : (
                <form onSubmit={handleSubmit} className="payment-form__form">
                    <CardElement
                        className="card-element"
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#32325d',
                                    fontFamily: 'Arial, sans-serif',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                    padding: '10px',
                                    border: '1px solid #aab7c4',
                                    borderRadius: '4px',
                                },
                                invalid: {
                                    color: '#e2594a',
                                    iconColor: '#e2594a',
                                },
                            },
                        }}
                    />

                    <button type="submit" disabled={!stripe || loading} className="submit-button">
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            )}
        </div>
    );
};

const OrderConfirmation = () => {
    const {id} = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await api.get(`/api/orders/${id}/`);
                setOrderDetails(response.data);
                if (response.data.status !== 'COMPLETED') {
                    const paymentIntentResponse = await api.post(`/api/orders/${id}/create_payment_intent/`);
                    setClientSecret(paymentIntentResponse.data.clientSecret);
                }
            } catch (error) {
                setError(error.message);
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);


    if (loading) return <p>Loading</p>
    if (error) return <p className="error-message">Error: {error}</p>

    const {user, address, city, country, products, total_price, status} = orderDetails;

    return (
        <div className="order-confirmation">
            <h1>Order Confirmation</h1>
            <p>Your Order with ID <strong>{id}</strong> has been placed successfully!</p>
            <h2>Order Details</h2>

            <div className="order-summary">
                <h3>Customer information</h3>
                <p><strong>Name:</strong> {user.username}</p>
                <p><strong>Address:</strong> {address}</p>
                <p><strong>City:</strong> {city}</p>
                <p><strong>Country:</strong> {country}</p>

                <h3>Products</h3>
                <ul className="product-list"> 
                    {products.map((product) => (
                        <li key={product.id} className="product-item">
                            <img src={product.image} alt={product.name} className="product-image"/>
                            <div className="product-details">
                                <h4>{product.name}</h4>
                                <p><strong>Quantity:</strong> {product.quantity}</p>
                                <p><strong>Price:</strong> ${product.price}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                <h3>Total Price</h3>
                <p>${total_price}</p>
                <h3>Status:</h3>
                <p>{status}</p>
            </div>

            {clientSecret && orderDetails && status !== "COMPLETED" && (
                <Elements stripe={stripePromise}>
                    <PaymentForm orderId={id} orderDetails={orderDetails} clientSecret={clientSecret}/>
                </Elements>
            )}
            {status === "COMPLETED" && 
                <p className="confirmation-message">
                    Your order has been completed successfully. Thank you for your order!
                </p>
            }
            
        </div>
    );
};

export default OrderConfirmation;