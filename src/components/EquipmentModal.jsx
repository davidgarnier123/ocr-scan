import './EquipmentModal.css';

/**
 * Détermine l'icône appropriée selon le type d'équipement
 * @param {string} type - Type d'équipement
 * @returns {string} Emoji représentant le type
 */
export const getEquipmentIcon = (type) => {
    const typeL = type?.toLowerCase() || '';

    if (typeL.includes('ordinateur') || typeL.includes('laptop') || typeL.includes('pc')) {
        return '💻';
    } else if (typeL.includes('téléphone') || typeL.includes('mobile') || typeL.includes('phone')) {
        return '📱';
    } else if (typeL.includes('moniteur') || typeL.includes('écran') || typeL.includes('screen')) {
        return '🖥️';
    } else if (typeL.includes('périphérique') || typeL.includes('accessoire')) {
        return '🔌';
    } else if (typeL.includes('tablette') || typeL.includes('tablet') || typeL.includes('ipad')) {
        return '📲';
    } else if (typeL.includes('imprimante') || typeL.includes('printer')) {
        return '🖨️';
    } else if (typeL.includes('réseau') || typeL.includes('network') || typeL.includes('switch') || typeL.includes('routeur')) {
        return '🌐';
    } else if (typeL.includes('stockage') || typeL.includes('disque') || typeL.includes('storage')) {
        return '💾';
    } else {
        return '📦';
    }
};

const EquipmentModal = ({ equipment, onClose }) => {
    if (!equipment) return null;

    return (
        <div className="equipment-modal-overlay" onClick={onClose}>
            <div className="equipment-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="equipment-modal-header">
                    <div className="equipment-title">
                        <span className="equipment-icon-large">{getEquipmentIcon(equipment.equipment_type)}</span>
                        <div>
                            <h2>{equipment.brand} {equipment.model}</h2>
                            <div className="equipment-badges">
                                <span className="equipment-type">{equipment.equipment_type}</span>
                                {equipment.internal_id && (
                                    <span className="internal-id-badge">
                                        ID: {equipment.internal_id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className="close-button" onClick={onClose} aria-label="Fermer">✕</button>
                </header>

                <div className="equipment-details">
                    {/* Section: Informations principales */}
                    <section className="detail-section">
                        <h3>📋 Informations principales</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Marque</span>
                                <span className="detail-value">{equipment.brand || '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Modèle</span>
                                <span className="detail-value">{equipment.model || '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Type</span>
                                <span className="detail-value">{equipment.equipment_type || '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">N° de série</span>
                                <span className="detail-value">{equipment.serial_number || '—'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Section: Attribution */}
                    <section className="detail-section">
                        <h3>👤 Attribution</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Agent</span>
                                <span className="detail-value">{equipment.agent_name || '—'}</span>
                            </div>
                            <div className="detail-item full-width">
                                <span className="detail-label">Service</span>
                                <span className="detail-value">{equipment.org_path || '—'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Section: Informations techniques */}
                    {(equipment.ip_address || equipment.mac_address || equipment.code || equipment.internal_id) && (
                        <section className="detail-section">
                            <h3>🔧 Informations techniques</h3>
                            <div className="detail-grid">
                                {equipment.ip_address && (
                                    <div className="detail-item">
                                        <span className="detail-label">Adresse IP</span>
                                        <span className="detail-value">{equipment.ip_address}</span>
                                    </div>
                                )}
                                {equipment.mac_address && (
                                    <div className="detail-item">
                                        <span className="detail-label">Adresse MAC</span>
                                        <span className="detail-value">{equipment.mac_address}</span>
                                    </div>
                                )}
                                {equipment.code && (
                                    <div className="detail-item">
                                        <span className="detail-label">Code</span>
                                        <span className="detail-value">{equipment.code}</span>
                                    </div>
                                )}
                                {equipment.internal_id && (
                                    <div className="detail-item">
                                        <span className="detail-label">ID interne</span>
                                        <span className="detail-value">{equipment.internal_id}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Section: Gestion */}
                    <section className="detail-section">
                        <h3>📅 Gestion</h3>
                        <div className="detail-grid">
                            {equipment.acquisition_date && (
                                <div className="detail-item">
                                    <span className="detail-label">Date d'acquisition</span>
                                    <span className="detail-value">{equipment.acquisition_date}</span>
                                </div>
                            )}
                            {equipment.extra_info && (
                                <div className="detail-item full-width">
                                    <span className="detail-label">Informations supplémentaires</span>
                                    <span className="detail-value">{equipment.extra_info}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section: Connexion */}
                    {equipment.connected_to && (
                        <section className="detail-section">
                            <h3>🔗 Connexion</h3>
                            <div className="detail-grid">
                                <div className="detail-item full-width">
                                    <span className="detail-label">Connecté à l'équipement</span>
                                    <span className="detail-value">{equipment.connected_to}</span>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentModal;
