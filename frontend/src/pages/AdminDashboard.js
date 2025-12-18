import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders'); // orders, users, finance, disputes
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [disputes, setDisputes] = useState([]); // <--- НОВОЕ СОСТОЯНИЕ
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'finance') fetchTransactions();
        else if (activeTab === 'disputes') fetchDisputes(); // <--- НОВЫЙ ВЫЗОВ
        else fetchOrders();
    }, [activeTab]);

    // --- API CALLS ---
    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.sort((a, b) => (a.verificationStatus === 'pending' ? -1 : 1)));
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data.sort((a, b) => (a.status === 'PENDING_MODERATION' ? -1 : 1)));
        } catch (e) { console.error(e); }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/admin/transactions');
            setTransactions(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (e) { console.error(e); }
    };

    // <--- НОВАЯ ФУНКЦИЯ ЗАГРУЗКИ СПОРОВ --->
    const fetchDisputes = async () => {
        try {
            const res = await api.get('/disputes'); // <--- ИСПРАВЛЕНО
            setDisputes(res.data.filter(d => d.status === 'open'));
        } catch (e) { console.error("Error fetching disputes", e); }
    };

    // --- HANDLERS ---
    const handleVerifyUser = async (id) => { /* ... */
        try { await api.put(`/admin/users/${id}/verify`); fetchUsers(); } catch (e) { alert("Error"); }
    };

    const handleBlockUser = async (id, currentStatus) => { /* ... */
        if(!window.confirm("Change block status?")) return;
        try { await api.put(`/admin/users/${id}/block`, null, { params: { blocked: !currentStatus } }); fetchUsers(); } catch (e) { alert("Error"); }
    };

    const handleModerateOrder = async (id, approved) => { /* ... */
        let reason = null;
        if (!approved) { reason = prompt("Rejection reason:"); if (!reason) return; }
        try { await api.post(`/orders/${id}/moderate`, null, { params: { approved, reason } }); fetchOrders(); } catch (e) { alert("Error"); }
    };

    const handleDeleteOrder = async (id) => { /* ... */
        if (!window.confirm("Delete order?")) return;
        try { await api.delete(`/admin/orders/${id}`); fetchOrders(); } catch (e) { alert("Error"); }
    };

    // <--- НОВАЯ ФУНКЦИЯ РЕШЕНИЯ СПОРА --->
    const handleResolveDispute = async (id, collectorWins) => {
        const comment = prompt("Add resolution comment (e.g. 'Proof accepted'):");
        try {
            await api.post(`/disputes/${id}/resolve`, null, {
                params: { collectorWins, comment: comment || '' }
            });
            alert("Dispute resolved!");
            fetchDisputes();
        } catch (e) {
            alert("Error resolving dispute: " + (e.response?.data || e.message));
        }
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

            {/* ВКЛАДКИ */}
            <div style={{marginBottom: 20, borderBottom: '1px solid #ddd'}}>
                <button onClick={() => setActiveTab('orders')} style={getTabStyle(activeTab === 'orders')}>Orders</button>
                <button onClick={() => setActiveTab('users')} style={getTabStyle(activeTab === 'users')}>Users</button>
                <button onClick={() => setActiveTab('finance')} style={getTabStyle(activeTab === 'finance')}>Transactions</button>
                <button onClick={() => setActiveTab('disputes')} style={getTabStyle(activeTab === 'disputes')}>Disputes</button> {/* <--- НОВАЯ КНОПКА */}
            </div>

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
                <div className="list-section">
                    {orders.length === 0 && <p>No orders to moderate.</p>}
                    {orders.map(order => (
                        <div key={order.id} className="order-item" style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft: order.status === 'PENDING_MODERATION' ? '5px solid orange' : '5px solid #ccc', padding: 10, marginBottom: 10, background: 'white'}}>
                            <div>
                                <strong>{order.description}</strong> ({order.price} RUB) <br/>
                                <small>{order.status}</small>
                            </div>
                            <div style={{display:'flex', gap: 5}}>
                                {order.status === 'PENDING_MODERATION' && (
                                    <>
                                        <button onClick={() => handleModerateOrder(order.id, true)} style={{background: 'green'}}>Approve</button>
                                        <button onClick={() => handleModerateOrder(order.id, false)} style={{background: 'orange'}}>Reject</button>
                                    </>
                                )}
                                <button onClick={() => handleDeleteOrder(order.id)} style={{background: '#dc3545'}}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB: USERS */}
            {activeTab === 'users' && (
                <div className="list-section">
                    <table style={{width: '100%'}}>
                        <thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.email}</td>
                                <td>{u.role.name}</td>
                                <td>{u.verificationStatus} {u.blocked && <b>(BANNED)</b>}</td>
                                <td>
                                    <button onClick={() => handleVerifyUser(u.id)} style={{marginRight:5}}>Verify</button>
                                    <button onClick={() => handleBlockUser(u.id, u.blocked)} style={{background: u.blocked?'gray':'red'}}>{u.blocked?'Unban':'Ban'}</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB: FINANCE */}
            {activeTab === 'finance' && (
                <div className="list-section">
                    <table style={{width: '100%'}}>
                        <thead><tr><th>Date</th><th>Type</th><th>User</th><th>Amount</th></tr></thead>
                        <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id}>
                                <td>{new Date(tx.createdAt).toLocaleString()}</td>
                                <td>{tx.type}</td>
                                <td>{tx.user?.email}</td>
                                <td>{tx.amount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB: DISPUTES (ВОТ СЮДА ВСТАВЛЕН ВАШ КОД) */}
            {activeTab === 'disputes' && (
                <div className="list-section">
                    {disputes.length === 0 && <p>No open disputes.</p>}
                    {disputes.map(d => (
                        <div key={d.id} className="order-item" style={{background: '#fff0f0', borderLeft: '5px solid red', padding: 10, marginBottom: 10}}>
                            <h4>Dispute on Order #{d.order.id.substring(0,8)}...</h4>
                            <p><strong>Customer Complaint:</strong> {d.description}</p>
                            <div style={{background: '#fff', padding: 5, fontSize: '0.9em', marginBottom: 10, border: '1px solid #eee'}}>
                                <strong>Collector Proof:</strong> {d.order.proofDescription} <br/>
                                <small>File: {d.order.proofFilePath}</small>
                            </div>
                            <div style={{display:'flex', gap: 10}}>
                                <button onClick={() => handleResolveDispute(d.id, true)} style={{background: 'green', width: 'auto'}}>Collector is Right (Pay)</button>
                                <button onClick={() => handleResolveDispute(d.id, false)} style={{background: 'red', width: 'auto'}}>Customer is Right (Refund)</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

const getTabStyle = (isActive) => ({
    marginRight: 10, padding: '10px 20px', border: 'none', cursor: 'pointer',
    borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
    backgroundColor: isActive ? '#e7f1ff' : 'transparent', color: isActive ? '#007bff' : '#555', fontWeight: 'bold'
});

export default AdminDashboard;