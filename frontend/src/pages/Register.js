import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // URL base del backend
    const backendUrl = 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            await axios.post(`${backendUrl}/register`, { username, password });
            alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
            window.location.href = '/login';
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message);
            } else {
                setError('Error al registrar el usuario. Intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Crear Cuenta</h1>
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
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar contraseña"
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : 'Registrarse'}
                    </button>
                </form>
                <p className="auth-link">
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;