import React, {createContext, useContext, useEffect, useReducer} from "react";
import { fetchCart, updateCart } from "./CartActions";

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case "SET_CART":
            return { ...state, cart: action.payload };
        case "ADD_TO_CART":
            const existingProductIndex = state.cart.findIndex(item => item.id === action.payload.id);
            if (existingProductIndex >= 0) {
                const newCart = [...state.cart];
                newCart[existingProductIndex].quantity += action.payload.quantity;
                return { ...state, cart: newCart };
            } else {
                return { ...state, cart: [...state.cart, action.payload] };
            }
        case "REMOVE_FROM_CART":
            return {
                ...state,
                cart: state.cart.filter(item => item.id !== action.payload),
            };
        case "REMOVE_QUANTITY":
            const itemIndex = state.cart.findIndex(item => item.id === action.payload.id);
            if (itemIndex >= 0) {
                const newCart = [...state.cart];
                if (newCart[itemIndex].quantity > 1) {
                    newCart[itemIndex].quantity -= 1; // decrease quantity by 1
                    return {...state, cart: newCart };
                } else {
                    //to handle if the quantity is 1, remove the item from the cart
                    return {
                        ...state, 
                        cart: state.cart.filter(item => item.id !== action.payload.id) 
                    };
                }
            }
            return state; // handle if current state not found
        case "INCREASE_QUANTITY":
            const increaseItemIndex = state.cart.findIndex(item => item.id === action.payload.id);
            if (increaseItemIndex >= 0) {
                const newCart = [...state.cart];
                newCart[increaseItemIndex].quantity += 1; // increase quantity by 1
                return {...state, cart: newCart };
            }
            return state; // handle if current state not found
        case 'CLEAR_CART':
            return {...state, cart: []};
        default:
            return state;

    };
};


export const CartProvider = ({ children}) => {
    const [state, dispatch] = useReducer(cartReducer, {cart: []});

    useEffect(() => {
        const getCart = async () => {
            const items = await fetchCart();
            dispatch({ type: 'SET_CART', payload: items });
        }
        getCart();
    }, []);

    const addToCart = async (item) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
        await updateCart(state.cart);
    };
 
    const removeFromCart = async (id) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
        await updateCart(state.cart);
    };

    const removeQuantityFromCart = async (id) => {
        dispatch({ type: 'REMOVE_QUANTITY', payload: { id } });
        await updateCart(state.cart);
    };

    const increaseQuantityInCart = async (id) => {
        dispatch({ type: 'INCREASE_QUANTITY', payload: { id } });
        await updateCart(state.cart);
    };

    const clearCart = async () => {
        dispatch({ type: 'CLEAR_CART' });
        await updateCart([]);
    };


    return (
        <CartContext.Provider value={{ state, addToCart, removeFromCart, removeQuantityFromCart, increaseQuantityInCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );

};

export const useCart = () => {
    return useContext(CartContext);
};