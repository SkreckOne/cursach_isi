import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'users', 'finance'
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    // Загрузка данных при переключении вкладок
    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'finance') fetchTransactions();
        else fetchOrders();
    }, [activeTab]);

    // --- API ЗАПРОСЫ ---

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            // Сортировка: сначала непроверенные (pending)
            setUsers(res.data.sort((a, b) => (a.verificationStatus === 'pending' ? -1 : 1)));
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            // Сортировка: сначала те, что ждут модерации
            setOrders(res.data.sort((a, b) => (a.status === 'PENDING_MODERATION' ? -1 : 1)));
        } catch (e) { console.error(e); }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/admin/transactions');
            // Сортировка: новые сверху
            setTransactions(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (e) { console.error(e); }
    };

    // --- ДЕЙСТВИЯ (HANDLERS) ---

    const handleVerifyUser = async (id) => {
        try {
            await api.put(`/admin/users/${id}/verify`);
            alert("User verified!");
            fetchUsers();
        } catch (e) { alert("Error verifying user"); }
    };

    const handleBlockUser = async (id, currentStatus) => {
        const action = currentStatus ? "unblock" : "block";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await api.put(`/admin/users/${id}/block`, null, { params: { blocked: !currentStatus } });
            fetchUsers();
        } catch (e) { alert("Error blocking user"); }
    };

    const handleModerateOrder = async (id, approved) => {
        let reason = null;
        if (!approved) {
            reason = prompt("Rejection reason:");
            if (!reason) return;
        }
        try {
            await api.post(`/orders/${id}/moderate`, null, { params: { approved, reason } });
            fetchOrders();
        } catch (e) { alert(e.response?.data || "Error moderating"); }
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
            <header className="header" style={{marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Admin Panel</h1>
                <div>
                    <button onClick={() => navigate('/orders')} style={{marginRight: 10}}>Back to Exchange</button>
                    <button onClick={() => {localStorage.clear(); navigate('/login');}} style={{backgroundColor: '#dc3545'}}>Logout</button>
                </div>
            </header>

            {/* Вкладки */}
            <div style={{marginBottom: 20, borderBottom: '1px solid #ddd'}}>
                <button onClick={() => setActiveTab('orders')} style={getTabStyle(activeTab === 'orders')}>Orders Moderation</button>
                <button onClick={() => setActiveTab('users')} style={getTabStyle(activeTab === 'users')}>Users</button>
                <button onClick={() => setActiveTab('finance')} style={getTabStyle(activeTab === 'finance')}>Transactions</button>
            </div>

            {/* 1. Вкладка ЗАКАЗЫ */}
            {activeTab === 'orders' && (
                <div className="list-section">
                    {orders.length === 0 && <p>No orders found.</p>}
                    {orders.map(order => (
                        <div key={order.id} className="order-item" style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft: order.status === 'PENDING_MODERATION' ? '5px solid orange' : '5px solid #ccc', padding: '10px', marginBottom: '10px', background: 'white', borderRadius: '4px'}}>
                            <div className="order-info">
                                <strong>{order.description}</strong> ({order.price} RUB)
                                <br/>
                                <small>Status: <span style={{fontWeight: 'bold'}}>{order.status}</span></small> <br/>
                                <small style={{color: '#888'}}>ID: {order.id}</small>
                            </div>
                            <div style={{display:'flex', gap: 5}}>
                                {/* Кнопки модерации только для статуса PENDING_MODERATION */}
                                {order.status === 'PENDING_MODERATION' && (
                                    <>
                                        <button onClick={() => handleModerateOrder(order.id, true)} style={{background: 'green', color: 'white'}}>Approve</button>
                                        <button onClick={() => handleModerateOrder(order.id, false)} style={{background: 'orange', color: 'black'}}>Reject</button>
                                    </>
                                )}
                                <button onClick={() => handleDeleteOrder(order.id)} style={{background: '#dc3545', color: 'white'}}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Вкладка ЮЗЕРЫ */}
            {activeTab === 'users' && (
                <div className="list-section">
                    <table style={{width: '100%', borderCollapse: 'collapse', background: 'white'}}>
                        <thead>
                        <tr style={{textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                            <th style={{padding: 10}}>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: 10}}>{u.email} {u.blocked && <span style={{color:'red', fontWeight: 'bold'}}>(BANNED)</span>}</td>
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
                                        <button onClick={() => handleVerifyUser(u.id)} style={{marginRight: 5, padding: '4px 8px', fontSize: 12, background: 'green', color: 'white'}}>Verify</button>
                                    )}
                                    <button
                                        onClick={() => handleBlockUser(u.id, u.blocked)}
                                        style={{padding: '4px 8px', fontSize: 12, background: u.blocked ? 'gray' : 'red', color: 'white'}}
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

            {/* 3. Вкладка ФИНАНСЫ */}
            {activeTab === 'finance' && (
                <div className="list-section">
                    <table style={{width: '100%', borderCollapse: 'collapse', background: 'white'}}>
                        <thead>
                        <tr style={{textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                            <th style={{padding: 10}}>Date</th>
                            <th>Type</th>
                            <th>User (Email)</th>
                            <th>Order ID</th>
                            <th>Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: 10}}>{new Date(tx.createdAt).toLocaleString()}</td>
                                <td>
                                        <span style={{
                                            padding: '2px 6px', borderRadius: 4, fontSize: 12,
                                            backgroundColor: tx.type === 'payment' ? '#ffc107' : '#28a745',
                                            color: 'black'
                                        }}>
                                            {tx.type}
                                        </span>
                                </td>
                                <td>{tx.user?.email || 'N/A'}</td>
                                <td style={{fontSize: 12, fontFamily: 'monospace'}}>{tx.order?.id?.substring(0, 8) || 'N/A'}...</td>
                                <td style={{fontWeight: 'bold'}}>
                                    {tx.type === 'withdrawal' ? '+' : '-'}{tx.amount} RUB
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Стили для кнопок вкладок
const getTabStyle = (isActive) => ({
    marginRight: 10,
    padding: '10px 20px',
    border: 'none',
    borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
    backgroundColor: isActive ? '#e7f1ff' : 'transparent',
    color: isActive ? '#007bff' : '#555',
    cursor: 'pointer',
    fontWeight: 'bold'
});

export default AdminDashboard;