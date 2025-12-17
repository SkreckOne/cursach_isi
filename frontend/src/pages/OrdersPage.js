import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    // --- State ---
    const [orders, setOrders] = useState([]);

    // Поля для создания заказа (Customer)
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [file, setFile] = useState(null);

    // Поля для сдачи работы (Collector)
    const [proofText, setProofText] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [activeOrderId, setActiveOrderId] = useState(null); // ID заказа, который сейчас сдает коллектор

    // Инфо о пользователе
    const navigate = useNavigate();
    const role = localStorage.getItem('role')?.toLowerCase();
    const email = localStorage.getItem('email');

    // --- Effects ---
    useEffect(() => {
        fetchOrders();
    }, []);

    // --- API Calls ---

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            // Сортировка: новые сверху
            const sortedOrders = response.data.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            if (error.response?.status === 403) {
                handleLogout();
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // 1. Создание заказа (Customer)
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please attach a document!");
            return;
        }

        const formData = new FormData();
        formData.append('description', description);
        formData.append('price', price);
        formData.append('file', file);

        try {
            await api.post('/orders', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Order created and sent for moderation!');
            fetchOrders();
            // Очистка формы
            setDescription('');
            setPrice('');
            setFile(null);
        } catch (error) {
            console.error("Create error:", error);
            alert("Failed to create order: " + (error.response?.data || "Unknown error"));
        }
    };

    // 2. Модерация (Admin)
    const handleModerate = async (id, approved) => {
        let reason = null;
        if (!approved) {
            reason = prompt("Enter rejection reason:");
            if (!reason) return; // Если отменили ввод - не отправляем
        }

        try {
            await api.post(`/orders/${id}/moderate`, null, {
                params: { approved, reason }
            });
            fetchOrders();
        } catch (e) {
            alert("Error moderating order: " + (e.response?.data || e.message));
        }
    };

    // 3. Взять заказ (Collector)
    const handleTake = async (id) => {
        if (!window.confirm("Are you sure you want to take this order?")) return;
        try {
            await api.post(`/orders/${id}/take`);
            fetchOrders();
        } catch (e) {
            alert("Error taking order: " + (e.response?.data || e.message));
        }
    };

    // 4. Сдать работу (Collector) - Открытие формы
    const openProofForm = (orderId) => {
        setActiveOrderId(orderId);
        setProofText('');
        setProofFile(null);
    };

    // 4.1 Отправка формы с доказательствами
    const handleSubmitProof = async (e) => {
        e.preventDefault();
        if (!proofFile) {
            alert("Please attach proof document");
            return;
        }

        const formData = new FormData();
        formData.append('proofText', proofText);
        formData.append('proofFile', proofFile);

        try {
            await api.post(`/orders/${activeOrderId}/submit-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Proof submitted successfully!");
            setActiveOrderId(null); // Закрыть форму
            fetchOrders();
        } catch (e) {
            alert("Error submitting proof: " + (e.response?.data || e.message));
        }
    };

    // 5. Подтверждение и Оплата (Customer)
    const handleApproveCompletion = async (id) => {
        if (!window.confirm("Confirm work completion and pay? This cannot be undone.")) return;
        try {
            await api.post(`/orders/${id}/approve-completion`);
            alert("Order closed and paid!");
            fetchOrders();
        } catch (e) {
            console.error(e);
            alert("Error approving: " + (e.response?.data || "Check console"));
        }
    };

    // --- Helpers ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING_MODERATION': return '#ffc107'; // Yellow
            case 'OPEN': return '#17a2b8'; // Blue (Info)
            case 'IN_PROGRESS': return '#007bff'; // Blue (Primary)
            case 'PENDING_REVIEW': return '#6610f2'; // Purple
            case 'COMPLETED': return '#28a745'; // Green
            case 'REJECTED': return '#dc3545'; // Red
            default: return '#6c757d'; // Grey
        }
    };

    // --- Render ---
    return (
        <div className="container">
            <header className="header">
                <h1>Debt Marketplace</h1>
                <div className="user-info">
                    <span style={{marginRight: '15px'}}><strong>{email}</strong> ({role})</span>
                    <button onClick={() => navigate('/profile')} style={{marginRight: '10px', backgroundColor: '#6c757d'}}>Profile</button>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            {/* --- Блок создания (Только Customer) --- */}
            {role === 'customer' && (
                <div className="form-section">
                    <h3>Create New Order</h3>
                    <form onSubmit={handleCreate}>
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
                        <div style={{margin: '10px 0'}}>
                            <label>Attach Documents (PDF/ZIP): </label>
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                        </div>
                        <button type="submit">Submit for Moderation</button>
                    </form>
                </div>
            )}

            {/* --- Блок отправки отчета (Модалка внутри страницы) --- */}
            {activeOrderId && (
                <div className="form-section" style={{borderColor: '#007bff', backgroundColor: '#f8f9fa'}}>
                    <h3>Submit Proof for Order</h3>
                    <form onSubmit={handleSubmitProof}>
                        <textarea
                            placeholder="Describe the result..."
                            value={proofText}
                            onChange={e => setProofText(e.target.value)}
                            rows={3}
                            style={{width: '100%', padding: '5px', marginBottom: '10px'}}
                            required
                        />
                        <div style={{marginBottom: '10px'}}>
                            <label>Attach Proof (PDF/Img): </label>
                            <input type="file" onChange={e => setProofFile(e.target.files[0])} required />
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button type="submit" style={{backgroundColor: '#28a745'}}>Send Report</button>
                            <button type="button" onClick={() => setActiveOrderId(null)} style={{backgroundColor: '#6c757d'}}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="list-section">
                <h3>{role === 'collector' ? 'Marketplace & My Tasks' : 'My Orders'}</h3>

                {orders.length === 0 ? <p>No orders found.</p> : (
                    <ul className="order-list">
                        {orders.map((order) => (
                            <li key={order.id} className="order-item">
                                <div className="order-info">
                                    <div style={{maxWidth: '60%'}}>
                                        <div style={{fontSize: '1.1em', fontWeight: 'bold'}}>{order.description}</div>
                                        <div style={{color: '#555', marginTop: '5px'}}>Price: {order.price} RUB</div>
                                        <div style={{fontSize: '0.8em', color: '#999', marginTop: '5px'}}>ID: {order.id}</div>

                                        {/* Если отклонен - показываем причину */}
                                        {order.status === 'REJECTED' && (
                                            <div style={{color: '#dc3545', marginTop: '5px', fontSize: '0.9em'}}>
                                                <strong>Reason:</strong> {order.moderationComment}
                                            </div>
                                        )}

                                        {/* Если сдан - показываем отчет (Заказчику и Админу) */}
                                        {order.status === 'PENDING_REVIEW' && (role === 'customer' || role === 'admin') && (
                                            <div style={{backgroundColor: '#e9ecef', padding: '10px', marginTop: '10px', borderRadius: '4px', fontSize: '0.9em'}}>
                                                <strong>Collector's Report:</strong><br/>
                                                {order.proofDescription}<br/>
                                                <small>File uploaded to MinIO: {order.proofFilePath}</small>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'}}>
                                        <span
                                            className="status"
                                            style={{
                                                backgroundColor: getStatusColor(order.status),
                                                color: 'white',
                                                padding: '5px 10px',
                                                borderRadius: '15px'
                                            }}
                                        >
                                            {order.status}
                                        </span>

                                        {/* --- КНОПКИ ДЕЙСТВИЙ --- */}

                                        {/* 1. АДМИН: Модерация */}
                                        {role === 'admin' && order.status === 'PENDING_MODERATION' && (
                                            <div style={{display: 'flex', gap: '5px'}}>
                                                <button onClick={() => handleModerate(order.id, true)} style={{backgroundColor: '#28a745', padding: '5px 10px', width: 'auto'}}>Approve</button>
                                                <button onClick={() => handleModerate(order.id, false)} style={{backgroundColor: '#dc3545', padding: '5px 10px', width: 'auto'}}>Reject</button>
                                            </div>
                                        )}

                                        {/* 2. КОЛЛЕКТОР: Взять заказ */}
                                        {role === 'collector' && order.status === 'OPEN' && (
                                            <button onClick={() => handleTake(order.id)} style={{backgroundColor: '#007bff'}}>Take Order</button>
                                        )}

                                        {/* 3. КОЛЛЕКТОР: Сдать работу */}
                                        {role === 'collector' && order.status === 'IN_PROGRESS' && (
                                            <button onClick={() => openProofForm(order.id)} style={{backgroundColor: '#17a2b8'}}>Submit Proof</button>
                                        )}

                                        {/* 4. ЗАКАЗЧИК: Принять работу и оплатить */}
                                        {role === 'customer' && order.status === 'PENDING_REVIEW' && (
                                            <button onClick={() => handleApproveCompletion(order.id)} style={{backgroundColor: '#6610f2'}}>Approve & Pay</button>
                                        )}
                                    </div>
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