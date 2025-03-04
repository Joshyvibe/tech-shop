import React, { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import '../styles/Products.css';
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "./CartContext";
import { useAuth } from "../auth.jsx";
import { useNavigate } from "react-router-dom";
import ReviewsList from "./ReviewList";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const { isAuthorized } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState({});
    const [loadingReviews, setLoadingReviews] = useState({});
    const [openReviews, setOpenReviews] = useState(new Set()); // Track opened reviews

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products/?limit=5');
                setProducts(response.data.results || response.data);
                console.log(response.data.results);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError(error.message);
                toast.error('Failed to load products');
            }
        };
        fetchProducts();
    }, []);

    const fetchReviews = async (productId) => {
        try {
            const response = await api.get('/products/' + productId + '/reviews/');
            setReviews((prev) => ({ ...prev, [productId]: response.data }));
            setLoadingReviews((prev) => ({ ...prev, [productId]: true }));
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError("Failed fetching reviews");
        } finally {
            setLoadingReviews((prev) => ({ ...prev, [productId]: false }));
        }
    };

    const handleAddToCart = (product) => {
        if (!isAuthorized) {
            navigate("/login");
        } else {
            const item = { ...product, quantity: 1 };
            addToCart(item);
            toast.success(`${product.name} added to cart!`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleSeeReviews = (productId) => {
        const updatedOpenReviews = new Set(openReviews);
        if (updatedOpenReviews.has(productId)) {
            updatedOpenReviews.delete(productId); // Close reviews if they are already open
        } else {
            updatedOpenReviews.add(productId); // Open reviews if they are closed
            if (!reviews[productId]) {
                fetchReviews(productId); // Fetch reviews only if not already fetched
            }
        }
        setOpenReviews(updatedOpenReviews); // Update the state
    };

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Featured Products</h1>
            <div className="product-grid">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="product-card">
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                            />
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p><strong>Price:</strong> ${product.price}</p>
                            <p><strong>Reviews: </strong>{product.review_count || 0} reviews</p>
                            <p><strong>Rating: </strong>{product.average_rating || "No rating yet"}</p>

                            <button
                                className="see-reviews-btn"
                                onClick={() => handleSeeReviews(product.id)}
                            >
                                {openReviews.has(product.id) ? "Close Reviews" : "See Reviews"}
                            </button>

                            {loadingReviews[product.id] ? (
                                <p>Loading reviews....</p>
                            ) : (
                                openReviews.has(product.id) && reviews[product.id] && <ReviewsList reviews={reviews[product.id]} />
                            )}

                            <button onClick={() => handleAddToCart(product)} className="add-to-cart-btn">
                                Add to Cart
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No products available</p>
                )}
            </div>
        </div>
    );
};

export default Products;
