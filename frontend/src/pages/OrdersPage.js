import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    // --- STATE ---
    const [orders, setOrders] = useState([]);

    // Форма создания (Customer)
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [file, setFile] = useState(null);

    // Форма сдачи работы (Collector)
    const [proofText, setProofText] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [activeOrderId, setActiveOrderId] = useState(null);

    // Просмотр откликов (Customer)
    const [applicants, setApplicants] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Инфо о пользователе
    const navigate = useNavigate();
    const role = localStorage.getItem('role')?.toLowerCase();
    const email = localStorage.getItem('email');

    // --- EFFECTS ---
    useEffect(() => {
        fetchOrders();
    }, []);

    // --- API CALLS ---

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            // Сортировка: новые сверху
            const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (error) {
            console.error("Error fetching orders", error);
            if (error.response && (error.response.status === 403 || error.response.status === 500)) {
                handleLogout();
            }
        }
    };

    // 1. Создание заказа (Customer)
    const handleCreate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('description', description);
        formData.append('price', price);
        formData.append('file', file);

        try {
            await api.post('/orders', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert('Order sent for moderation!');
            fetchOrders();
            setDescription(''); setPrice(''); setFile(null);
        } catch (e) { alert("Error creating order: " + (e.response?.data || e.message)); }
    };

    // 2. Откликнуться на заказ (Collector)
    const handleApply = async (id) => {
        try {
            await api.post(`/orders/${id}/apply`);
            alert("Applied successfully! Wait for customer approval.");
        } catch (e) { alert(e.response?.data || "Error applying"); }
    };

    // 3. Загрузить отклики (Customer)
    const loadApplicants = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}/applications`);
            setApplicants(res.data);
            setSelectedOrderId(orderId);
        } catch (e) { alert("Error loading applicants"); }
    };

    // 4. Нанять коллектора (Customer)
    const handleHireCollector = async (orderId, collectorId) => {
        if(!window.confirm("Hire this collector?")) return;
        try {
            await api.post(`/orders/${orderId}/approve-collector/${collectorId}`);
            alert("Collector hired! Order is now IN PROGRESS.");
            setSelectedOrderId(null);
            fetchOrders();
        } catch (e) { alert("Error hiring collector"); }
    };

    // 5. Открыть форму сдачи (Collector)
    const openProofForm = (id) => {
        setActiveOrderId(id);
        setProofText('');
        setProofFile(null);
    };

    // 6. Отправить отчет (Collector)
    const handleSubmitProof = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('proofText', proofText);
        formData.append('proofFile', proofFile);

        try {
            await api.post(`/orders/${activeOrderId}/submit-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert("Proof submitted!");
            setActiveOrderId(null);
            fetchOrders();
        } catch (e) { alert("Error submitting proof"); }
    };

    // 7. Принять работу и оплатить (Customer)
    const handleApproveCompletion = async (id) => {
        if(!window.confirm("Confirm completion and PAY?")) return;
        try {
            await api.post(`/orders/${id}/approve-completion`);
            alert("Order closed and paid!");
            fetchOrders();
        } catch (e) { alert("Error approving: " + (e.response?.data || "Check console")); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING_MODERATION': return '#ffc107'; // Yellow
            case 'OPEN': return '#17a2b8'; // Cyan
            case 'IN_PROGRESS': return '#007bff'; // Blue
            case 'PENDING_REVIEW': return '#6610f2'; // Purple
            case 'COMPLETED': return '#28a745'; // Green
            case 'REJECTED': return '#dc3545'; // Red
            default: return '#6c757d';
        }
    };

    // --- RENDER ---
    return (
        <div className="container">
            <header className="header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 15, background: 'white', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <h1 style={{margin: 0}}>Debt Exchange</h1>
                <div className="user-info">
                    <span style={{marginRight: 15}}><strong>{email}</strong> ({role})</span>

                    {/* Кнопка Админки */}
                    {role === 'admin' && (
                        <button onClick={() => navigate('/admin')} style={{marginRight: 10, background: '#6610f2'}}>Admin Panel</button>
                    )}

                    <button onClick={() => navigate('/profile')} style={{marginRight: 10}}>Profile</button>
                    <button onClick={handleLogout} style={{backgroundColor: '#dc3545'}}>Logout</button>
                </div>
            </header>

            {/* FORM: Create Order (Customer) */}
            {role === 'customer' && (
                <div className="form-section">
                    <h3>Create New Order</h3>
                    <form onSubmit={handleCreate}>
                        <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
                        <input type="number" placeholder="Price (RUB)" value={price} onChange={e => setPrice(e.target.value)} required />
                        <div style={{margin: '10px 0'}}>
                            <label>Document (PDF): </label>
                            <input type="file" onChange={e => setFile(e.target.files[0])} required />
                        </div>
                        <button type="submit">Submit to Exchange</button>
                    </form>
                </div>
            )}

            {/* MODAL: Applicants List (Customer) */}
            {selectedOrderId && (
                <div className="form-section" style={{border: '2px solid orange', backgroundColor: '#fff3cd'}}>
                    <h3>Applicants for Order</h3>
                    {applicants.length === 0 ? <p>No applicants yet.</p> : (
                        <ul style={{listStyle: 'none', padding: 0}}>
                            {applicants.map(app => (
                                <li key={app.id} style={{padding: 10, borderBottom: '1px solid #ccc', display:'flex', justifyContent:'space-between', alignItems: 'center', background: 'white', marginBottom: 5}}>
                                    <span>
                                        <strong>{app.collector.email}</strong> <br/>
                                        <small>Applied: {new Date(app.createdAt).toLocaleString()}</small>
                                    </span>
                                    <div>
                                        {/* Тут можно добавить кнопку просмотра профиля */}
                                        <button onClick={() => handleHireCollector(selectedOrderId, app.collector.id)} style={{background: '#28a745'}}>Hire</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={() => setSelectedOrderId(null)} style={{background: '#6c757d', marginTop: 10}}>Close</button>
                </div>
            )}

            {/* MODAL: Submit Proof (Collector) */}
            {activeOrderId && (
                <div className="form-section" style={{border: '2px solid #007bff', backgroundColor: '#f0f8ff'}}>
                    <h3>Submit Work Report</h3>
                    <form onSubmit={handleSubmitProof}>
                        <textarea placeholder="Describe work done..." value={proofText} onChange={e => setProofText(e.target.value)} rows={3} style={{width: '100%', marginBottom: 10}} required />
                        <div style={{marginBottom: 10}}>
                            <label>Proof Document: </label>
                            <input type="file" onChange={e => setProofFile(e.target.files[0])} required />
                        </div>
                        <div style={{display: 'flex', gap: 10}}>
                            <button type="submit" style={{backgroundColor: '#28a745'}}>Send</button>
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
                                    <div style={{maxWidth: '65%'}}>
                                        <strong>{order.description}</strong>
                                        <div style={{color: '#666'}}>{order.price} RUB</div>
                                        <div style={{fontSize: '11px', color: '#aaa'}}>ID: {order.id}</div>

                                        {/* Если отказано */}
                                        {order.status === 'REJECTED' && (
                                            <div style={{color: 'red', fontSize: '0.9em', marginTop: 5}}>Reason: {order.moderationComment}</div>
                                        )}
                                        {/* Если есть отчет */}
                                        {order.status === 'PENDING_REVIEW' && (
                                            <div style={{background: '#e2e3e5', padding: 8, marginTop: 5, borderRadius: 4, fontSize: '0.9em'}}>
                                                <strong>Report:</strong> {order.proofDescription}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5}}>
                                        <span className="status" style={{backgroundColor: getStatusColor(order.status), color: 'white'}}>{order.status}</span>

                                        {/* КНОПКИ ДЕЙСТВИЙ */}

                                        {/* Collector: Apply */}
                                        {role === 'collector' && order.status === 'OPEN' && (
                                            <button onClick={() => handleApply(order.id)} style={{background: '#007bff'}}>Apply</button>
                                        )}

                                        {/* Collector: Submit Proof */}
                                        {role === 'collector' && order.status === 'IN_PROGRESS' && (
                                            <button onClick={() => openProofForm(order.id)} style={{background: '#17a2b8'}}>Submit Proof</button>
                                        )}

                                        {/* Customer: View Applicants */}
                                        {role === 'customer' && order.status === 'OPEN' && (
                                            <button onClick={() => loadApplicants(order.id)} style={{background: '#ffc107', color: 'black'}}>View Applicants</button>
                                        )}

                                        {/* Customer: Pay */}
                                        {role === 'customer' && order.status === 'PENDING_REVIEW' && (
                                            <button onClick={() => handleApproveCompletion(order.id)} style={{background: '#6610f2'}}>Approve & Pay</button>
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