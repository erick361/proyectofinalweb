import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function Purchase() {
    const [otherVehicles, setOtherVehicles] = useState([]);
    const user_id = localStorage.getItem('user_id');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    
    const backendUrl = 'http://localhost:5000';
    

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            // Obtener todos los vehículos
            const allVehiclesResponse = await axios.get(`${backendUrl}/all-vehicles`);
            
            if (allVehiclesResponse.data && allVehiclesResponse.data.length > 0) {
                // Filtrar los vehículos para mostrar solo los que no pertenecen al usuario actual
                const filtered = allVehiclesResponse.data.filter(vehicle => 
                    vehicle.user_id && vehicle.user_id.toString() !== user_id.toString()
                );
                
                setOtherVehicles(filtered);
            } else {
                setOtherVehicles([]);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setError('Error al cargar los vehículos. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyVehicle = async (vehicle) => {
        try {
            const user_id = localStorage.getItem('user_id');
            
            if (!user_id) {
                alert('Debes iniciar sesión para comprar vehículos');
                window.location.href = '/login';
                return;
            }
            
            // Usar la ruta correcta para transferir la propiedad del vehículo
            await axios.post(`${backendUrl}/vehicles/buy/${vehicle.id}`, {
                buyer_id: user_id
            });
            
            alert('¡Vehículo comprado con éxito!');
            fetchVehicles(); // Actualizar la lista después de la compra
        } catch (error) {
            console.error('Error buying vehicle:', error);
            if (error.response && error.response.data) {
                alert(error.response.data.message);
            } else {
                alert('Error al comprar el vehículo');
            }
        }
    };

    const handleBackToDashboard = () => {
        window.location.href = '/dashboard';
    };

    return (
        <div className="purchase-container container">
            <div className="purchase-header">
                <h1>Compra de Vehículos</h1>
                <button onClick={handleBackToDashboard}>Regresar al Dashboard</button>
            </div>
            
            {loading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando vehículos...</p>
                </div>
            ) : error ? (
                <div className="message error-message">{error}</div>
            ) : otherVehicles.length === 0 ? (
                <div className="message">
                    No hay vehículos disponibles para comprar. Asegúrate de que otros usuarios hayan agregado vehículos.
                </div>
            ) : (
                <div className="market-vehicles">
                    {otherVehicles.map(vehicle => (
                        <div className="market-vehicle-card" key={vehicle.id}>
                            <img 
                                src={`${backendUrl}${vehicle.image}`} 
                                alt={vehicle.type}
                                className="market-vehicle-img" 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = vehicle.type === 'SUV' 
                                        ? '/suv.png' 
                                        : '/sedan.png';
                                }}
                            />
                            <div className="market-vehicle-details">
                                <h3 className="market-vehicle-title">{vehicle.name}</h3>
                                <div className="market-vehicle-info">
                                    <span className="market-vehicle-year">Año: {vehicle.year}</span>
                                    <span className="market-vehicle-type">{vehicle.type}</span>
                                </div>
                                <div className="market-vehicle-actions">
                                    <button 
                                        className="btn-success" 
                                        onClick={() => handleBuyVehicle(vehicle)}
                                    >
                                        Comprar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Purchase;