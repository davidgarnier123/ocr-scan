import { useState } from 'react';
import InventoryCard from '../components/InventoryCard';
import './InventoryList.css';

const InventoryList = ({ inventories, onDelete }) => {
    const [selectedInventory, setSelectedInventory] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?')) {
            onDelete(id);
            if (selectedInventory?.id === id) {
                setSelectedInventory(null);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="inventory-list-page">
            <div className="page-header">
                <h1>Historique des inventaires</h1>
                <p className="page-subtitle">
                    {inventories.length} inventaire(s) enregistré(s)
                </p>
            </div>

            {inventories.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h2>Aucun inventaire</h2>
                    <p>Commencez par scanner des équipements et finaliser une session.</p>
                </div>
            ) : (
                <div className="inventory-grid">
                    {inventories.map(inventory => (
                        <InventoryCard
                            key={inventory.id}
                            inventory={inventory}
                            onView={setSelectedInventory}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {selectedInventory && (
                <div className="modal-overlay" onClick={() => setSelectedInventory(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>{selectedInventory.agent.name}</h2>
                                <p className="modal-service">{selectedInventory.agent.service}</p>
                            </div>
                            <button
                                className="btn-close"
                                onClick={() => setSelectedInventory(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-info">
                            <div className="info-item">
                                <span className="info-icon">📅</span>
                                <span>{formatDate(selectedInventory.createdAt)}</span>
                            </div>
                            {selectedInventory.notes && (
                                <div className="info-item">
                                    <span className="info-icon">📝</span>
                                    <span>{selectedInventory.notes}</span>
                                </div>
                            )}
                        </div>

                        <div className="devices-section">
                            <h3>Équipements scannés ({selectedInventory.devices.length})</h3>
                            <div className="devices-list">
                                {selectedInventory.devices.map((device, index) => (
                                    <div key={index} className="device-item">
                                        <span className="device-number">#{index + 1}</span>
                                        <span className="device-code">{device}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryList;
