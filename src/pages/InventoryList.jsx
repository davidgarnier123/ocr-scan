import { useState } from 'react';
import InventoryCard from '../components/InventoryCard';
import EquipmentModal from '../components/EquipmentModal';
import ExportButton from '../components/ExportButton';
import { getEquipmentDatabase } from '../utils/storage';
import './InventoryList.css';

const InventoryList = ({ inventories, onDelete }) => {
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const equipmentDatabase = getEquipmentDatabase();

    const handleDelete = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?')) {
            onDelete(id);
        }
    };

    return (
        <div className="inventory-list-page">
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>Historique</h1>
                        <p className="page-subtitle">
                            {inventories.length} inventaire(s)
                        </p>
                    </div>
                    <ExportButton inventories={inventories} equipmentDatabase={equipmentDatabase} />
                </div>
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
                            onDelete={handleDelete}
                            onDeviceClick={setSelectedEquipment}
                        />
                    ))}
                </div>
            )}

            <EquipmentModal
                equipment={selectedEquipment}
                onClose={() => setSelectedEquipment(null)}
            />
        </div>
    );
};

export default InventoryList;
