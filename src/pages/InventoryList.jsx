import InventoryCard from '../components/InventoryCard';
import { getEquipmentDatabase } from '../utils/storage';
import './InventoryList.css';

const InventoryList = ({ inventories, onDelete }) => {
    const equipmentDatabase = getEquipmentDatabase();

    const handleDelete = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?')) {
            onDelete(id);
        }
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
                            equipmentDatabase={equipmentDatabase}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default InventoryList;
