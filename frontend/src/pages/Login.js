import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // URL base del backend
    const backendUrl = 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post(`${backendUrl}/login`, { username, password });
            if (response.status === 200) {
                localStorage.setItem('user_id', response.data.user_id);
                window.location.href = '/dashboard';
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message);
            } else {
                setError('Error al iniciar sesión. Intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Bienvenido</h1>
                <h2>Iniciar Sesión</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nombre de usuario"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : 'Iniciar Sesión'}
                    </button>
                </form>
                <p className="auth-link">
                    ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
