import { useState, useMemo } from 'react';
import InventoryCard from '../components/InventoryCard';
import EquipmentModal from '../components/EquipmentModal';
import { getEquipmentDatabase, extractAgentsFromDatabase } from '../utils/storage';
import './ConsultationPage.css';

const ConsultationPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const equipmentDatabase = getEquipmentDatabase();
    const agents = useMemo(() => extractAgentsFromDatabase(), []);

    // Filter agents based on search term
    const filteredAgents = useMemo(() => {
        if (!searchTerm) return [];
        const lowerTerm = searchTerm.toLowerCase();
        return agents.filter(agent =>
            agent.name.toLowerCase().includes(lowerTerm) ||
            agent.service.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, agents]);

    // Get inventory for selected agent
    const agentInventory = useMemo(() => {
        if (!selectedAgent) return [];
        return equipmentDatabase.filter(item => item.agent_name === selectedAgent.name);
    }, [selectedAgent, equipmentDatabase]);

    // Group inventory by type for better display
    const inventoryByType = useMemo(() => {
        const groups = {};
        agentInventory.forEach(item => {
            const type = item.equipment_type || 'Autre';
            if (!groups[type]) groups[type] = [];
            groups[type].push(item);
        });
        return groups;
    }, [agentInventory]);

    const handleAgentSelect = (agent) => {
        setSelectedAgent(agent);
        setSearchTerm(''); // Clear search to hide dropdown
    };

    const getEquipmentIcon = (type) => {
        const typeL = type?.toLowerCase() || '';
        if (typeL.includes('laptop') || typeL.includes('portable')) return '💻';
        if (typeL.includes('desktop') || typeL.includes('fixe')) return '🖥️';
        if (typeL.includes('monitor') || typeL.includes('ecran')) return '📺';
        if (typeL.includes('phone') || typeL.includes('telephone')) return '📱';
        if (typeL.includes('tablet') || typeL.includes('tablette')) return '📟';
        if (typeL.includes('printer') || typeL.includes('imprimante')) return '🖨️';
        return '🔌';
    };

    return (
        <div className="consultation-page">
            <div className="page-header">
                <h1>Consultation Agent</h1>
                <p className="page-subtitle">Recherchez un agent pour voir son inventaire</p>
            </div>

            <div className="search-section">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Rechercher un agent..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (selectedAgent && e.target.value !== selectedAgent.name) {
                                setSelectedAgent(null);
                            }
                        }}
                        className="agent-search-input"
                    />
                </div>

                {searchTerm && filteredAgents.length > 0 && !selectedAgent && (
                    <div className="agents-dropdown">
                        {filteredAgents.map(agent => (
                            <div
                                key={agent.name}
                                className="agent-option"
                                onClick={() => handleAgentSelect(agent)}
                            >
                                <div className="agent-option-name">{agent.name}</div>
                                <div className="agent-option-service">{agent.service}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedAgent && (
                <div className="agent-details-container">
                    <div className="agent-header-card">
                        <div className="agent-avatar">
                            {selectedAgent.name.charAt(0)}
                        </div>
                        <div className="agent-info-large">
                            <h2>{selectedAgent.name}</h2>
                            <p>{selectedAgent.service}</p>
                            <div className="inventory-stats">
                                <span className="stat-badge">
                                    {agentInventory.length} équipement{agentInventory.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="inventory-results">
                        {Object.entries(inventoryByType).map(([type, items]) => (
                            <div key={type} className="type-section">
                                <h3>{getEquipmentIcon(type)} {type} ({items.length})</h3>
                                <div className="equipment-grid">
                                    {items.map(item => (
                                        <div
                                            key={item.barcode_id}
                                            className="equipment-card-mini"
                                            onClick={() => setSelectedEquipment(item)}
                                        >
                                            <div className="equipment-mini-header">
                                                <span className="equipment-brand">{item.brand}</span>
                                                <span className="equipment-model">{item.model}</span>
                                            </div>
                                            <div className="equipment-mini-code">{item.barcode_id}</div>
                                            {item.internal_id && (
                                                <div className="equipment-mini-internal">ID: {item.internal_id}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {agentInventory.length === 0 && (
                            <div className="empty-inventory">
                                <p>Aucun équipement assigné à cet agent.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <EquipmentModal
                equipment={selectedEquipment}
                onClose={() => setSelectedEquipment(null)}
            />
        </div>
    );
};

export default ConsultationPage;
