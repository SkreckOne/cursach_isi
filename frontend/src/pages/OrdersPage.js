import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    // --- STATE ---
    const [orders, setOrders] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');

    // Форма создания (Customer)
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [file, setFile] = useState(null);

    // Форма сдачи работы (Collector)
    const [proofText, setProofText] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [activeOrderId, setActiveOrderId] = useState(null);
    const [appliedOrderIds, setAppliedOrderIds] = useState([]);

    // Просмотр откликов (Customer)
    const [applicants, setApplicants] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Инфо о пользователе
    const navigate = useNavigate();
    const role = localStorage.getItem('role')?.toLowerCase();
    const email = localStorage.getItem('email');



    const [reviewOrderId, setReviewOrderId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    // --- EFFECTS ---
    useEffect(() => {
        fetchOrders();
        // Если я коллектор - загружаю свои заявки
        if (role === 'collector') {
            fetchAppliedIds();
        }
    }, [role]);
    // --- API CALLS ---

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };
    const fetchAppliedIds = async () => {
        try {
            const res = await api.get('/orders/my-applications');
            setAppliedOrderIds(res.data);
        } catch (e) { console.error("Error fetching applications", e); }
    };


    const fetchOrders = async (query = '') => {
        try {
            const response = await api.get('/orders', {
                params: { search: query }
            });
            // Сортировка: новые сверху
            setOrders(response.data)
        } catch (error) {
            console.error("Error fetching orders", error);
            if (error.response && (error.response.status === 403 || error.response.status === 500)) {
                handleLogout();
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrders(searchQuery);
    };

    // Сброс поиска
    const handleClearSearch = () => {
        setSearchQuery('');
        fetchOrders('');
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

            // Обновляем список кнопок (если есть эта функция)
            if (typeof fetchAppliedIds === 'function') fetchAppliedIds();
        } catch (e) {
            // Бэкенд прислал текст ошибки в e.response.data
            const message = e.response?.data || "Error applying";

            // Если профиль не создан, можно даже предложить перейти
            if (message.includes("create your profile")) {
                if (window.confirm(message + "\n\nGo to Profile page now?")) {
                    navigate('/profile');
                }
            } else {
                alert(message);
            }
        }
    };


    const handleWithdraw = async (id) => {
        if (!window.confirm("Withdraw your application?")) return;
        try {
            await api.delete(`/orders/${id}/application`);
            alert("Application withdrawn.");
            fetchAppliedIds(); // Обновляем список, чтобы кнопка сменилась на Apply
        } catch (e) { alert("Error withdrawing"); }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reviews', {
                orderId: reviewOrderId,
                rating: parseInt(rating),
                comment: comment
            });
            alert("Review submitted! The collector's rating has been updated.");
            setReviewOrderId(null); // Закрыть форму
            setComment('');
        } catch (e) {
            alert("Error: " + (e.response?.data || e.message));
        }
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
    const handleModerate = async (id, approved) => {
        let reason = null;
        if (!approved) {
            reason = prompt("Enter rejection reason:");
            if (!reason) return; // Если нажали Отмена
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

    return (
        <div className="container">
            {/* --- 1. HEADER --- */}
            <header className="header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                padding: 15,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{margin: 0}}>Debt Exchange</h1>
                <div className="user-info">
                    <span style={{marginRight: 15}}><strong>{email}</strong> ({role})</span>

                    {/* Кнопка Админки (только для admin) */}
                    {role === 'admin' && (
                        <button onClick={() => navigate('/admin')} style={{marginRight: 10, background: '#6610f2', width: 'auto'}}>Admin Panel</button>
                    )}

                    <button onClick={() => navigate('/profile')} style={{marginRight: 10, width: 'auto'}}>Profile</button>
                    <button onClick={handleLogout} style={{backgroundColor: '#dc3545', width: 'auto'}}>Logout</button>
                </div>
            </header>

            {/* --- 2. SEARCH BAR --- */}
            <div style={{margin: '0 0 20px 0', padding: '15px', background: 'white', borderRadius: 8, display: 'flex', gap: 10}}>
                <input
                    type="text"
                    placeholder="Search orders by description or price..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{flex: 1, padding: 8}}
                />
                <button onClick={handleSearch} style={{background: '#007bff', width: 'auto'}}>Search</button>
                {searchQuery && (
                    <button onClick={handleClearSearch} style={{background: '#6c757d', width: 'auto'}}>Clear</button>
                )}
            </div>

            {/* --- 3. CREATE ORDER FORM (Only Customer) --- */}
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

            {/* --- 4. MODALS / ACTIVE FORMS --- */}

            {/* A. Просмотр откликов (Для Заказчика) */}
            {selectedOrderId && (
                <div className="form-section" style={{border: '2px solid orange', backgroundColor: '#fff3cd'}}>
                    <h3>Applicants for Order</h3>
                    {applicants.length === 0 ? <p>No applicants yet.</p> : (
                        <ul style={{listStyle: 'none', padding: 0}}>
                            {applicants.map(app => (
                                <li key={app.id} style={{padding: 15, borderBottom: '1px solid #ccc', background: 'white', marginBottom: 10, borderRadius: 8}}>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                        <div>
                                            <div style={{fontSize: '1.1em', fontWeight: 'bold'}}>{app.email}</div>

                                            {/* --- ИНФОРМАЦИЯ О КОЛЛЕКТОРЕ --- */}
                                            <div style={{marginTop: 5, color: '#555', fontSize: '0.9em'}}>
                                                <div>⭐ <strong>Rating:</strong> {app.rating || '0.0'} / 5.0</div>
                                                <div>💰 <strong>Rate:</strong> {app.hourlyRate ? `${app.hourlyRate} RUB/hour` : 'Not specified'}</div>
                                                <div>📍 <strong>Region:</strong> {app.region || 'Unknown'}</div>
                                            </div>

                                            <div style={{marginTop: 5, fontSize: '0.8em', color: '#999'}}>
                                                Applied: {new Date(app.appliedAt).toLocaleString()}
                                            </div>
                                        </div>

                                        <div>
                                            <button
                                                onClick={() => handleHireCollector(selectedOrderId, app.collectorId)}
                                                style={{background: '#28a745', padding: '8px 16px', fontSize: '14px', width: 'auto'}}
                                            >
                                                Hire This Pro
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={() => setSelectedOrderId(null)} style={{background: '#6c757d', marginTop: 10, width: 'auto'}}>Close</button>
                </div>
            )}

            {/* B. Сдача работы (Для Коллектора) */}
            {activeOrderId && (
                <div className="form-section" style={{border: '2px solid #007bff', backgroundColor: '#f0f8ff'}}>
                    <h3>Submit Work Report</h3>
                    <form onSubmit={handleSubmitProof}>
                        <textarea
                            placeholder="Describe work done..."
                            value={proofText}
                            onChange={e => setProofText(e.target.value)}
                            rows={3}
                            style={{width: '100%', marginBottom: 10, padding: 5}}
                            required
                        />
                        <div style={{marginBottom: 10}}>
                            <label>Proof Document: </label>
                            <input type="file" onChange={e => setProofFile(e.target.files[0])} required />
                        </div>
                        <div style={{display: 'flex', gap: 10}}>
                            <button type="submit" style={{backgroundColor: '#28a745', width: 'auto'}}>Send</button>
                            <button type="button" onClick={() => setActiveOrderId(null)} style={{backgroundColor: '#6c757d', width: 'auto'}}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- 5. ORDERS LIST --- */}
            <div className="list-section">
                <h3>{role === 'collector' ? 'Marketplace & My Tasks' : 'My Orders'}</h3>

                {orders.length === 0 ? <p>No orders found.</p> : (
                    <ul className="order-list">
                        {orders.map((order) => (
                            <li key={order.id} className="order-item">
                                <div className="order-info">
                                    {/* ЛЕВАЯ ЧАСТЬ (Описание, цена, статус отказа) - ОСТАВЛЯЕМ КАК ЕСТЬ */}
                                    <div style={{maxWidth: '60%'}}>
                                        <div style={{fontSize: '1.1em', fontWeight: 'bold'}}>{order.description}</div>
                                        <div style={{color: '#555', marginTop: '5px'}}>Price: {order.price} RUB</div>
                                        <div style={{fontSize: '0.8em', color: '#999', marginTop: '5px'}}>ID: {order.id}</div>

                                        {order.status === 'REJECTED' && (
                                            <div style={{color: '#dc3545', marginTop: '5px', fontSize: '0.9em'}}>
                                                <strong>Reason:</strong> {order.moderationComment}
                                            </div>
                                        )}
                                        {order.status === 'PENDING_REVIEW' && (role === 'customer' || role === 'admin') && (
                                            <div style={{backgroundColor: '#e9ecef', padding: '10px', marginTop: '10px', borderRadius: '4px', fontSize: '0.9em'}}>
                                                <strong>Report:</strong> {order.proofDescription}
                                            </div>
                                        )}
                                    </div>

                                    {/* ПРАВАЯ ЧАСТЬ (Статус и Кнопки) - ВСТАВЛЯЕМ СЮДА */}
                                    <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'}}>
                <span
                    className="status"
                    style={{
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '12px'
                    }}
                >
                    {order.status}
                </span>

                                        {/* --- КНОПКИ ДЕЙСТВИЙ --- */}

                                        {/* 1. АДМИН: Модерация (Оставляем) */}
                                        {role === 'admin' && order.status === 'PENDING_MODERATION' && (
                                            <div style={{display: 'flex', gap: '5px'}}>
                                                <button onClick={() => handleModerate(order.id, true)} style={{backgroundColor: '#28a745', padding: '5px 10px', width: 'auto', fontSize: '12px'}}>Approve</button>
                                                <button onClick={() => handleModerate(order.id, false)} style={{backgroundColor: '#dc3545', padding: '5px 10px', width: 'auto', fontSize: '12px'}}>Reject</button>
                                            </div>
                                        )}

                                        {/* 2. КОЛЛЕКТОР: Apply / Withdraw (ВСТАВЛЯЕМ ВАШ КОД СЮДА) */}
                                        {role === 'collector' && order.status === 'OPEN' && (
                                            <>
                                                {/* Если ID есть в списке appliedOrderIds -> показываем Withdraw */}
                                                {appliedOrderIds.includes(order.id) ? (
                                                    <button
                                                        onClick={() => handleWithdraw(order.id)}
                                                        style={{background: '#6c757d', border: '1px solid #999', width: 'auto'}}
                                                    >
                                                        Withdraw Application
                                                    </button>
                                                ) : (
                                                    /* Иначе показываем Apply */
                                                    <button
                                                        onClick={() => handleApply(order.id)}
                                                        style={{background: '#007bff', width: 'auto'}}
                                                    >
                                                        Apply
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {/* 3. КОЛЛЕКТОР: Сдать работу (Оставляем) */}
                                        {role === 'collector' && order.status === 'IN_PROGRESS' && (
                                            <button onClick={() => openProofForm(order.id)} style={{backgroundColor: '#17a2b8', width: 'auto'}}>Submit Proof</button>
                                        )}

                                        {/* 4. ЗАКАЗЧИК: Посмотреть отклики (Оставляем) */}
                                        {role === 'customer' && order.status === 'OPEN' && (
                                            <button onClick={() => loadApplicants(order.id)} style={{backgroundColor: '#ffc107', color: 'black', width: 'auto'}}>View Applicants</button>
                                        )}

                                        {/* 5. ЗАКАЗЧИК: Принять и оплатить (Оставляем) */}
                                        {role === 'customer' && order.status === 'PENDING_REVIEW' && (
                                            <button onClick={() => handleApproveCompletion(order.id)} style={{backgroundColor: '#6610f2', width: 'auto'}}>Approve & Pay</button>
                                        )}

                                        {/* 6. ЗАКАЗЧИК: Отзыв (Оставляем) */}
                                        {role === 'customer' && order.status?.toUpperCase() === 'COMPLETED' && !order.hasReview && (
                                            <button onClick={() => setReviewOrderId(order.id)} style={{backgroundColor: '#ffc107', color: 'black', width: 'auto'}}>⭐ Rate</button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* --- 6. REVIEW MODAL (OVERLAY) --- */}
            {reviewOrderId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{background: 'white', padding: 20, borderRadius: 8, width: 400, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                        <h3 style={{marginTop: 0}}>Leave a Review</h3>
                        <form onSubmit={handleSubmitReview}>
                            <label style={{display: 'block', marginBottom: 5}}>Rating (1-5):</label>
                            <select
                                value={rating}
                                onChange={e => setRating(e.target.value)}
                                style={{width: '100%', marginBottom: 15, padding: 8}}
                            >
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Good</option>
                                <option value="3">3 - Normal</option>
                                <option value="2">2 - Bad</option>
                                <option value="1">1 - Terrible</option>
                            </select>

                            <label style={{display: 'block', marginBottom: 5}}>Comment:</label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={4}
                                style={{width: '100%', marginBottom: 15, padding: 5, boxSizing: 'border-box'}}
                                required
                                placeholder="Describe your experience..."
                            />

                            <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                                <button type="button" onClick={() => setReviewOrderId(null)} style={{background: '#6c757d', width: 'auto'}}>Cancel</button>
                                <button type="submit" style={{background: '#28a745', width: 'auto'}}>Submit Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );}

export default OrdersPage;