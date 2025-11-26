import './InventoryCard.css';

const InventoryCard = ({ inventory, onView, onDelete }) => {
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
        <div className="inventory-card">
            <div className="inventory-header">
                <div className="agent-info">
                    <h3 className="agent-name">{inventory.agent.name}</h3>
                    <p className="agent-service">{inventory.agent.service}</p>
                </div>
            </div>

            <div className="inventory-meta">
                <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span className="meta-text">{formatDate(inventory.createdAt)}</span>
                </div>
                {inventory.notes && (
                    <div className="meta-item">
                        <span className="meta-icon">📝</span>
                        <span className="meta-text">{inventory.notes}</span>
                    </div>
                )}
            </div>

            <div className="inventory-devices-preview">
                <h4>Équipements scannés ({inventory.devices.length})</h4>
                <div className="devices-grid">
                    {inventory.devices.map((device, index) => (
                        <span key={index} className="device-tag">{device}</span>
                    ))}
                </div>
            </div>

            <div className="inventory-actions">
                <button className="btn-view" onClick={() => onView(inventory)}>
                    👁️ Voir détails
                </button>
                <button className="btn-delete" onClick={() => onDelete(inventory.id)}>
                    🗑️
                </button>
            </div>
        </div>
    );
};

export default InventoryCard;
