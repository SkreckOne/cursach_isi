import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    // Создание заказа
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [file, setFile] = useState(null);
    // Отклики
    const [applicants, setApplicants] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null); // ID заказа, чьи отклики смотрим

    const navigate = useNavigate();
    const role = localStorage.getItem('role')?.toLowerCase();
    const email = localStorage.getItem('email');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) { console.error(error); }
    };

    // --- Customer Logic ---
    const handleCreate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('description', description);
        formData.append('price', price);
        formData.append('file', file);
        try {
            await api.post('/orders', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert('Order created!');
            fetchOrders();
        } catch (e) { alert("Error"); }
    };

    const handleLogout = () => {
        localStorage.clear(); // Удаляет токен и роль
        navigate('/login');   // Перенаправляет на вход
    };

    const loadApplicants = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}/applications`);
            setApplicants(res.data);
            setSelectedOrderId(orderId);
        } catch (e) { alert("Error loading applicants"); }
    };

    const handleApproveCollector = async (orderId, collectorId) => {
        if(!window.confirm("Hire this collector?")) return;
        try {
            await api.post(`/orders/${orderId}/approve-collector/${collectorId}`);
            alert("Collector hired!");
            setSelectedOrderId(null);
            fetchOrders();
        } catch (e) { alert("Error approving"); }
    };

    const viewCollectorProfile = (collectorId) => {
        // Открываем профиль в новой вкладке или переходим
        // Тут нужно сделать страницу PublicProfilePage, но пока алерт с ID
        alert("View profile feature coming soon for ID: " + collectorId);
        // navigate('/profile/' + collectorId);
    };

    // --- Collector Logic ---
    const handleApply = async (id) => {
        try {
            await api.post(`/orders/${id}/apply`);
            alert("Applied successfully! Wait for customer approval.");
        } catch (e) { alert(e.response?.data || "Error applying"); }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Debt Marketplace</h1>
                <div className="user-info">
                    {/* ... тут скорее всего span с email и кнопка Profile ... */}

                    <span>{email} ({role})</span>
                    <button onClick={() => navigate('/profile')}>Profile</button>

                    {/* --- ВСТАВИТЬ СЮДА --- */}
                    <button
                        onClick={handleLogout}
                        style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}
                    >
                        Logout
                    </button>
                    {/* --------------------- */}

                </div>
            </header>

            {role === 'customer' && (
                <div className="form-section">
                    <h3>Create New Order</h3>
                    <form onSubmit={handleCreate}>
                        <input placeholder="Desc" value={description} onChange={e => setDescription(e.target.value)} required />
                        <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
                        <input type="file" onChange={e => setFile(e.target.files[0])} required />
                        <button type="submit">Create</button>
                    </form>
                </div>
            )}

            {/* БЛОК ПРОСМОТРА ОТКЛИКОВ (Только для Заказчика) */}
            {selectedOrderId && (
                <div className="form-section" style={{border: '2px solid orange'}}>
                    <h3>Applicants for Order</h3>
                    {applicants.length === 0 ? <p>No applicants yet.</p> : (
                        <ul>
                            {applicants.map(app => (
                                <li key={app.id} style={{padding: 10, borderBottom: '1px solid #ccc', display:'flex', justifyContent:'space-between'}}>
                                    <span>
                                        <strong>Collector:</strong> {app.collector.email} <br/>
                                        <small>Applied: {new Date(app.createdAt).toLocaleString()}</small>
                                    </span>
                                    <div>
                                        <button onClick={() => viewCollectorProfile(app.collector.id)} style={{marginRight: 5, background: '#17a2b8'}}>View Profile</button>
                                        <button onClick={() => handleApproveCollector(selectedOrderId, app.collector.id)} style={{background: '#28a745'}}>Hire</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={() => setSelectedOrderId(null)} style={{background: '#6c757d', marginTop: 10}}>Close</button>
                </div>
            )}

            <div className="list-section">
                <h3>Orders</h3>
                <ul className="order-list">
                    {orders.map((order) => (
                        <li key={order.id} className="order-item">
                            <div className="order-info">
                                <div>
                                    <strong>{order.description}</strong> ({order.price} RUB)
                                    <br/><span className={`status ${order.status}`}>{order.status}</span>
                                </div>
                                <div>
                                    {/* COLLECTOR ACTIONS */}
                                    {role === 'collector' && order.status === 'OPEN' && (
                                        <button onClick={() => handleApply(order.id)}>Apply</button>
                                    )}

                                    {/* CUSTOMER ACTIONS */}
                                    {role === 'customer' && order.status === 'OPEN' && (
                                        <button onClick={() => loadApplicants(order.id)} style={{background: 'orange'}}>View Applicants</button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OrdersPage;