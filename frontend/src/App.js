import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import './App.css';

// Компонент для защиты роутов (если нет токена - редирект на логин)
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/orders"
                    element={
                        <PrivateRoute>
                            <OrdersPage />
                        </PrivateRoute>
                    }
                />

                {/* По умолчанию редирект на заказы (или логин, если не авторизован) */}
                <Route path="*" element={<Navigate to="/orders" />} />
            </Routes>
        </Router>
    );
}

export default App;