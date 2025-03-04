import api from "../api";
import { ACCESS_TOKEN, GOOGLE_ACCESS_TOKEN } from "../token";

export const fetchCart = async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const googleAccessToken = localStorage.getItem(GOOGLE_ACCESS_TOKEN);

    // determinw token to use

    const headers = {};
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    } else if (googleAccessToken) {
        headers["X-Google-Access-Token"] = googleAccessToken;
    } else {
        throw new Error("No access token found");
    }

    // fetch our cart

    const response = await api.get('/api/cart/', { headers });
    console.log("Cart response:", response.data);
    return response.data.items;

};

// function to update cart items

export const updateCart = async (cartItems) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const googleAccessToken = localStorage.getItem(GOOGLE_ACCESS_TOKEN);

    // determine the access token to use
    const headers = {};
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    } else if (googleAccessToken) {
        headers["X-Google-Access-Token"] = googleAccessToken;
    } else {
        throw new Error("No access token found");
    }

    // update the cart

    await api.put('/api/cart/', { items: cartItems }, { headers });
}