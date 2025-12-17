import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'users'
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        else fetchOrders();
    }, [activeTab]);

    // --- ЗАГРУЗКА ДАННЫХ ---
    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            // Сортируем: сначала непроверенные
            setUsers(res.data.sort((a, b) => (a.verificationStatus === 'pending' ? -1 : 1)));
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders'); // Админ видит все заказы через этот метод
            // Сортируем: сначала требующие модерации
            setOrders(res.data.sort((a, b) => (a.status === 'PENDING_MODERATION' ? -1 : 1)));
        } catch (e) { console.error(e); }
    };

    // --- ДЕЙСТВИЯ С ПОЛЬЗОВАТЕЛЯМИ ---
    const handleVerifyUser = async (id) => {
        try {
            await api.put(`/admin/users/${id}/verify`);
            alert("User verified!");
            fetchUsers();
        } catch (e) { alert("Error"); }
    };

    const handleBlockUser = async (id, currentStatus) => {
        const action = currentStatus ? "unblock" : "block";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await api.put(`/admin/users/${id}/block`, null, { params: { blocked: !currentStatus } });
            fetchUsers();
        } catch (e) { alert("Error"); }
    };

    // --- ДЕЙСТВИЯ С ЗАКАЗАМИ ---
    const handleModerateOrder = async (id, approved) => {
        let reason = null;
        if (!approved) {
            reason = prompt("Rejection reason:");
            if (!reason) return;
        }
        try {
            await api.post(`/orders/${id}/moderate`, null, { params: { approved, reason } });
            fetchOrders();
        } catch (e) { alert("Error"); }
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm("DELETE order permanently?")) return;
        try {
            await api.delete(`/admin/orders/${id}`);
            fetchOrders();
        } catch (e) { alert("Error deleting"); }
    };

    // --- RENDER ---
    return (
        <div className="container">
            <header className="header" style={{marginBottom: 20}}>
                <h1>Admin Panel</h1>
                <div>
                    <button onClick={() => navigate('/orders')} style={{marginRight: 10}}>Back to Exchange</button>
                    <button onClick={() => {localStorage.clear(); navigate('/login');}} style={{backgroundColor: '#dc3545'}}>Logout</button>
                </div>
            </header>

            {/* TABS */}
            <div style={{marginBottom: 20, borderBottom: '1px solid #ddd'}}>
                <button
                    onClick={() => setActiveTab('orders')}
                    style={{marginRight: 10, backgroundColor: activeTab==='orders'?'#007bff':'#eee', color: activeTab==='orders'?'white':'black'}}
                >
                    Orders Moderation
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{backgroundColor: activeTab==='users'?'#007bff':'#eee', color: activeTab==='users'?'white':'black'}}
                >
                    Users Management
                </button>
            </div>

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div className="list-section">
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                        <tr style={{textAlign: 'left', backgroundColor: '#f8f9fa'}}>
                            <th style={{padding: 10}}>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: 10}}>{u.email} {u.blocked && <span style={{color:'red'}}>(BANNED)</span>}</td>
                                <td>{u.role.name}</td>
                                <td>
                                        <span style={{
                                            padding: '2px 6px', borderRadius: 4, fontSize: 12,
                                            backgroundColor: u.verificationStatus === 'verified' ? '#28a745' : '#ffc107',
                                            color: u.verificationStatus === 'verified' ? 'white' : 'black'
                                        }}>
                                            {u.verificationStatus}
                                        </span>
                                </td>
                                <td>
                                    {u.verificationStatus !== 'verified' && (
                                        <button onClick={() => handleVerifyUser(u.id)} style={{marginRight: 5, padding: '2px 8px', fontSize: 12, background: 'green'}}>Verify</button>
                                    )}
                                    <button
                                        onClick={() => handleBlockUser(u.id, u.blocked)}
                                        style={{padding: '2px 8px', fontSize: 12, background: u.blocked ? 'gray' : 'red'}}
                                    >
                                        {u.blocked ? 'Unban' : 'Ban'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="list-section">
                    {orders.map(order => (
                        <div key={order.id} className="order-item" style={{display:'flex', justifyContent:'space-between', borderLeft: order.status === 'PENDING_MODERATION' ? '5px solid orange' : '5px solid #ccc'}}>
                            <div className="order-info">
                                <strong>{order.description}</strong> ({order.price} RUB)
                                <br/>
                                <small>Status: {order.status}</small> <br/>
                                <small>ID: {order.id}</small>
                            </div>
                            <div style={{display:'flex', gap: 5, alignItems: 'center'}}>
                                {/* Модерация */}
                                {order.status === 'PENDING_MODERATION' && (
                                    <>
                                        <button onClick={() => handleModerateOrder(order.id, true)} style={{background: 'green'}}>Approve</button>
                                        <button onClick={() => handleModerateOrder(order.id, false)} style={{background: 'orange'}}>Reject</button>
                                    </>
                                )}
                                {/* Удаление */}
                                <button onClick={() => handleDeleteOrder(order.id)} style={{background: '#dc3545'}}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;