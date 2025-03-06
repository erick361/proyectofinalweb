import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function Dashboard() {
    const [vehicles, setVehicles] = useState([]);
    const [newVehicle, setNewVehicle] = useState({ name: '', year: '', type: '' });
    const [editVehicle, setEditVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // URL base del backend
    const backendUrl = 'http://localhost:5000';

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const user_id = localStorage.getItem('user_id');
            if (!user_id) {
                window.location.href = '/login';
                return;
            }
            
            const response = await axios.get(`${backendUrl}/vehicles`, {
                params: { user_id }
            });
            setVehicles(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('No pudimos cargar tus vehículos. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const user_id = localStorage.getItem('user_id');
            await axios.post(`${backendUrl}/vehicles`, { ...newVehicle, user_id });
            setNewVehicle({ name: '', year: '', type: '' });
            fetchVehicles();
        } catch (err) {
            console.error('Error adding vehicle:', err);
            setError('No pudimos agregar el vehículo. Por favor, intenta nuevamente.');
        }
    };

    const handleEditVehicle = async (e) => {
        e.preventDefault();
        try {
            const user_id = localStorage.getItem('user_id');
            await axios.put(`${backendUrl}/vehicles/${editVehicle.id}`, { ...editVehicle, user_id });
            setEditVehicle(null);
            fetchVehicles();
        } catch (err) {
            console.error('Error editing vehicle:', err);
            setError('No pudimos editar el vehículo. Por favor, intenta nuevamente.');
        }
    };

    const handleDeleteVehicle = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
            try {
                const user_id = localStorage.getItem('user_id');
                await axios.delete(`${backendUrl}/vehicles/${id}`, {
                    data: { user_id }
                });
                fetchVehicles();
            } catch (err) {
                console.error('Error deleting vehicle:', err);
                setError('No pudimos eliminar el vehículo. Por favor, intenta nuevamente.');
            }
        }
    };

    const handleEditClick = (vehicle) => {
        setEditVehicle(vehicle);
    };

    const handleLogout = () => {
        localStorage.removeItem('user_id');
        window.location.href = '/login';
    };

    const handleGoToPurchase = () => {
        window.location.href = '/purchase';
    };

    return (
        <div className="dashboard-container container">
            <div className="dashboard-header">
                <h1>Mi Garaje</h1>
                <div className="dashboard-actions">
                    <button onClick={handleGoToPurchase}>Explorar Mercado</button>
                    <button onClick={handleLogout} className="btn-danger">Cerrar Sesión</button>
                </div>
            </div>

            {error && <div className="message error-message">{error}</div>}

            <div className="dashboard-content">
                <div className="dashboard-form">
                    <h2>{editVehicle ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}</h2>
                    <form onSubmit={editVehicle ? handleEditVehicle : handleAddVehicle}>
                        <input
                            type="text"
                            value={editVehicle ? editVehicle.name : newVehicle.name}
                            onChange={(e) => editVehicle 
                                ? setEditVehicle({ ...editVehicle, name: e.target.value }) 
                                : setNewVehicle({ ...newVehicle, name: e.target.value })}
                            placeholder="Nombre del vehículo"
                            required
                        />
                        <input
                            type="number"
                            value={editVehicle ? editVehicle.year : newVehicle.year}
                            onChange={(e) => editVehicle 
                                ? setEditVehicle({ ...editVehicle, year: e.target.value }) 
                                : setNewVehicle({ ...newVehicle, year: e.target.value })}
                            placeholder="Año"
                            required
                        />
                        <select
                            value={editVehicle ? editVehicle.type : newVehicle.type}
                            onChange={(e) => editVehicle 
                                ? setEditVehicle({ ...editVehicle, type: e.target.value }) 
                                : setNewVehicle({ ...newVehicle, type: e.target.value })}
                            required
                        >
                            <option value="">Selecciona el tipo</option>
                            <option value="SUV">SUV</option>
                            <option value="Sedan">Sedan</option>
                        </select>
                        <button type="submit">
                            {editVehicle ? 'Guardar Cambios' : 'Agregar Vehículo'}
                        </button>
                        {editVehicle && (
                            <button 
                                type="button" 
                                onClick={() => setEditVehicle(null)} 
                                className="btn-danger" 
                                style={{marginTop: '10px'}}
                            >
                                Cancelar
                            </button>
                        )}
                    </form>
                </div>

                <div className="vehicles-list">
                    <h2>Mis Vehículos</h2>
                    
                    {loading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <p>Cargando vehículos...</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="message">
                            No tienes vehículos registrados. ¡Agrega uno nuevo!
                        </div>
                    ) : (
                        <div className="vehicles-grid">
                            {vehicles.map(vehicle => (
                                <div className="vehicle-card" key={vehicle.id}>
                                    <img 
                                        src={`${backendUrl}${vehicle.image}`} 
                                        alt={vehicle.type}
                                        className="vehicle-img" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = vehicle.type === 'SUV' 
                                                ? '/suv.png' 
                                                : '/sedan.png';
                                        }}
                                    />
                                    <div className="vehicle-details">
                                        <div className="vehicle-title">{vehicle.name}</div>
                                        <div className="vehicle-info">
                                            <span>Año: {vehicle.year}</span> | <span>Tipo: {vehicle.type}</span>
                                        </div>
                                        <div className="vehicle-actions">
                                            <button onClick={() => handleEditClick(vehicle)}>Editar</button>
                                            <button 
                                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                                className="btn-danger"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;