import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        role: 'customer'
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/signup', formData);
            navigate('/login');
        } catch (err) {
            const errorMsg = err.response?.data || err.message;
            console.error("Registration error:", errorMsg);
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <div style={{marginBottom: '10px'}}>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{marginBottom: '10px'}}>
                    <input
                        name="password"
                        type="password"
                        placeholder="Password (min 6 chars)"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{marginBottom: '10px'}}>
                    <input
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{marginBottom: '10px'}}>
                    <select name="role" onChange={handleChange} value={formData.role}>
                        <option value="customer">Customer (Заказчик)</option>
                        <option value="collector">Collector (Коллектор)</option>
                    </select>
                </div>

                <button type="submit">Sign Up</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default RegisterPage;