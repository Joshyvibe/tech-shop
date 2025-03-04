import React from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";

import '../styles/Cart.css';


const Cart = () => {
    const {state: {cart}, removeFromCart, clearCart, removeQuantityFromCart, increaseQuantityInCart} = useCart();
    const navigate = useNavigate();

    const handleRemove = (id) => {
        removeFromCart(id);
    };

    const handleClearCart = () => {
        clearCart();
    }

    const handleIncreaseQuantity = (id) => {
        increaseQuantityInCart(id);
    }

    const handleDecreaseQuantity = (id) => {
        removeQuantityFromCart(id);
    }

    const handleCheckout = () => {
        // Redirect to checkout page
        navigate('/checkout');
    }

    if (cart.length === 0) {
        return <p>Your cart is empty...</p>
    }

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>
            <div className="cart-items">
                {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            style={{width: '100px', height: '100px', objectFit: 'cover'}}
                        />
                        <div className="cart-item-info">
                            <h2>{item.name}</h2>
                            <p><strong>Price:</strong> ${item.price}</p>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <button onClick={() => handleIncreaseQuantity(item.id)} className="increase-btn">
                                Increase
                            </button>
                            <button onClick={() => handleDecreaseQuantity(item.id)} className="decrease-btn">
                                Decrease
                            </button>
                            <button onClick={() => handleRemove(item.id)} className="remove-btn">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-actions">
                <button onClick={handleClearCart} className="clear-cart-btn">Clear Cart</button>
                <p><strong>Total:</strong> ${cart.reduce((total, item) => total + item.price * item.quantity, 0)}</p>
                <button onClick={handleCheckout} className="checkout-btn">Proceed to Checkout</button>
            </div>
        </div>
    );
};

export default Cart;