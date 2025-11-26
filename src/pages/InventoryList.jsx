import { useState, useMemo } from 'react';
import InventoryCard from '../components/InventoryCard';
import { getEquipmentDatabase } from '../utils/storage';
import './InventoryList.css';

const InventoryList = ({ inventories, onDelete }) => {
    const [selectedInventory, setSelectedInventory] = useState(null);
    const equipmentDatabase = getEquipmentDatabase();

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

    // Calculate comparison stats for the selected inventory
    const comparisonData = useMemo(() => {
        if (!selectedInventory) return null;

        const scannedCodes = new Set(selectedInventory.devices);
        const agentName = selectedInventory.agent.name;

        // Get expected items for this agent
        const expectedItems = equipmentDatabase.filter(
            item => item.agent_name === agentName
        );
        const expectedCodes = new Set(expectedItems.map(item => item.barcode_id));

        const processedDevices = [];

        // 1. Process scanned items (Confirmed or Added)
        selectedInventory.devices.forEach(code => {
            if (expectedCodes.has(code)) {
                processedDevices.push({ code, status: 'confirmed' });
            } else {
                processedDevices.push({ code, status: 'added' });
            }
        });

        // 2. Find missing items (Expected but not scanned)
        expectedItems.forEach(item => {
            if (!scannedCodes.has(item.barcode_id)) {
                processedDevices.push({
                    code: item.barcode_id,
                    status: 'missing',
                    details: `${item.brand} ${item.model} (${item.equipment_type})`
                });
            }
        });

        return processedDevices;
    }, [selectedInventory, equipmentDatabase]);

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
                            equipmentDatabase={equipmentDatabase}
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
                            <h3>Détail des équipements</h3>
                            <div className="devices-legend">
                                <span className="legend-item"><span className="dot confirmed"></span>Confirmé</span>
                                <span className="legend-item"><span className="dot added"></span>Ajouté</span>
                                <span className="legend-item"><span className="dot missing"></span>Manquant</span>
                            </div>
                            <div className="devices-list">
                                {comparisonData.map((device, index) => (
                                    <div key={index} className={`device-item ${device.status}`}>
                                        <span className="device-status-icon">
                                            {device.status === 'confirmed' && '✅'}
                                            {device.status === 'added' && '➕'}
                                            {device.status === 'missing' && '⚠️'}
                                        </span>
                                        <div className="device-details">
                                            <span className="device-code">{device.code}</span>
                                            {device.details && <span className="device-meta">{device.details}</span>}
                                        </div>
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
