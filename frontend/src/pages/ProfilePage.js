import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const [profile, setProfile] = useState({});
    const [allMethods, setAllMethods] = useState([]); // Все доступные методы
    const [loading, setLoading] = useState(true);

    const role = localStorage.getItem('role')?.toLowerCase();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        companyName: '',
        inn: '',
        description: '',
        hourlyRate: '',
        region: '',
        workMethodIds: [] // Выбранные методы
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // Загружаем профиль
                const profileRes = await api.get('/profiles/me');
                const p = profileRes.data || {};

                // Загружаем методы работы (если коллектор)
                let methodsRes = [];
                if (role === 'collector') {
                    const res = await api.get('/profiles/methods');
                    methodsRes = res.data;
                    setAllMethods(methodsRes);
                }

                // Мапим данные в форму
                setFormData({
                    companyName: p.companyName || '',
                    inn: p.inn || '',
                    description: p.description || '',
                    hourlyRate: p.hourlyRate || '',
                    region: p.region || '',
                    // Если у пользователя уже есть методы, они должны прийти в профиле.
                    // (Нужно доработать Backend DTO, если хотим предзаполнять. Пока оставим пустым для простоты выбора)
                    workMethodIds: []
                });
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        loadData();
    }, [role]);

    const handleMethodChange = (methodId) => {
        const currentIds = [...formData.workMethodIds];
        if (currentIds.includes(methodId)) {
            setFormData({...formData, workMethodIds: currentIds.filter(id => id !== methodId)});
        } else {
            setFormData({...formData, workMethodIds: [...currentIds, methodId]});
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = role === 'collector' ? '/profiles/collector' : '/profiles/customer';
            await api.put(endpoint, formData);
        } catch (e) { alert('Error updating profile'); }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <header className="header">
                <h1>Edit Profile</h1>
                <div>
                    <button onClick={() => navigate('/orders')}>Back</button>

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

            <div className="form-section">
                <form onSubmit={handleSave}>
                    {role === 'customer' ? (
                        <>
                            <label>Company:</label>
                            <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} required />
                            <label>INN:</label>
                            <input value={formData.inn} onChange={e => setFormData({...formData, inn: e.target.value})} required />
                        </>
                    ) : (
                        <>
                            <label>Region:</label>
                            <input value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} required />
                            <label>Rate (RUB):</label>
                            <input type="number" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: e.target.value})} required />
                            <label>Description:</label>
                            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

                            {/* Выбор методов работы */}
                            <label style={{marginTop: 20, display: 'block'}}><strong>Work Methods:</strong></label>
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 5}}>
                                {allMethods.map(m => (
                                    <label key={m.id} style={{border: '1px solid #ccc', padding: 5, borderRadius: 4}}>
                                        <input
                                            type="checkbox"
                                            checked={formData.workMethodIds.includes(m.id)}
                                            onChange={() => handleMethodChange(m.id)}
                                        /> {m.name}
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                    <button type="submit" style={{marginTop: 20}}>Save</button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;