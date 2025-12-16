import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders", error);
            if (error.response && error.response.status === 403) {
                handleLogout();
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please attach a document");
            return;
        }

        const formData = new FormData();
        formData.append('customerId', userId); // Берем ID из локального хранилища
        formData.append('description', description);
        formData.append('price', price);
        formData.append('file', file);

        try {
            await api.post('/orders', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Order created!');
            fetchOrders();
            setDescription('');
            setPrice('');
            setFile(null);
        } catch (error) {
            console.error("Error creating order", error);
            alert("Failed to create order");
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Debt Marketplace</h1>
                <div className="user-info">
                    <span>{localStorage.getItem('email')} ({role})</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            {/* Форму показываем только заказчикам */}
            {role === 'customer' && (
                <div className="form-section">
                    <h3>Create New Order</h3>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Description (e.g. Debt from LLC Romashka)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price (RUB)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                        <button type="submit">Publish Order</button>
                    </form>
                </div>
            )}

            <div className="list-section">
                <h3>Available Orders</h3>
                {orders.length === 0 ? <p>No orders found.</p> : (
                    <ul className="order-list">
                        {orders.map((order) => (
                            <li key={order.id} className="order-item">
                                <div className="order-info">
                                    <strong>{order.description}</strong>
                                    <span>Price: {order.price} RUB</span>
                                    <span className={`status ${order.status}`}>{order.status}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;