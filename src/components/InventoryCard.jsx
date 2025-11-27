import './InventoryCard.css';

const InventoryCard = ({ inventory, equipmentDatabase, onDelete, onDeviceClick }) => {
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

    // Helper to get icon based on equipment type
    const getDeviceIcon = (type) => {
        if (!type) return '📦';
        const lowerType = type.toLowerCase();
        if (lowerType.includes('laptop') || lowerType.includes('portable')) return '💻';
        if (lowerType.includes('desktop') || lowerType.includes('fixe')) return '🖥️';
        if (lowerType.includes('monitor') || lowerType.includes('ecran')) return '📺';
        if (lowerType.includes('phone') || lowerType.includes('telephone')) return '📱';
        if (lowerType.includes('tablet') || lowerType.includes('tablette')) return '📟';
        if (lowerType.includes('printer') || lowerType.includes('imprimante')) return '🖨️';
        return '🔌';
    };

    // Process devices to determine status and details
    const processedDevices = inventory.devices.map(code => {
        // Find the device in the database
        const deviceInDb = equipmentDatabase.find(item => item.barcode_id === code);

        // Check if it belongs to this agent
        const isConfirmed = deviceInDb && deviceInDb.agent_name === inventory.agent.name;

        return {
            code,
            status: isConfirmed ? 'confirmed' : 'added',
            type: deviceInDb ? deviceInDb.equipment_type : 'Inconnu',
            icon: getDeviceIcon(deviceInDb ? deviceInDb.equipment_type : null),
            data: deviceInDb || { barcode_id: code, equipment_type: 'Inconnu' }
        };
    });

    return (
        <div className="inventory-card">
            <div className="inventory-header">
                <div className="agent-info">
                    <h3 className="agent-name">{inventory.agent.name}</h3>
                    <p className="agent-service">{inventory.agent.service}</p>
                </div>
                <button className="btn-delete-icon" onClick={() => onDelete(inventory.id)} title="Supprimer">
                    🗑️
                </button>
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

            <div className="inventory-devices-list">
                {processedDevices.map((device, index) => (
                    <div
                        key={index}
                        className={`device-row ${device.status}`}
                        onClick={() => onDeviceClick && onDeviceClick(device.data)}
                    >
                        <span className="device-icon" title={device.type}>{device.icon}</span>
                        <span className="device-code">{device.code}</span>
                        <span className="device-status-indicator">
                            {device.status === 'confirmed' ? '✅' : '➕'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryCard;
