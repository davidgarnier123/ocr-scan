import { useState, useMemo } from 'react';
import { getEquipmentDatabase, getDatabaseMeta } from '../utils/storage';
import EquipmentModal, { getEquipmentIcon } from '../components/EquipmentModal';
import './SearchPage.css';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [agentFilter, setAgentFilter] = useState('');
    const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
    const [agentSearchTerm, setAgentSearchTerm] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    const equipmentDatabase = getEquipmentDatabase();
    const databaseMeta = getDatabaseMeta();

    // Extract unique values for filters
    const { types, brands, agents } = useMemo(() => {
        const typesSet = new Set();
        const brandsSet = new Set();
        const agentsSet = new Set();

        equipmentDatabase.forEach(eq => {
            if (eq.equipment_type) typesSet.add(eq.equipment_type);
            if (eq.brand) brandsSet.add(eq.brand);
            if (eq.agent_name && eq.agent_name !== '""') agentsSet.add(eq.agent_name);
        });

        return {
            types: Array.from(typesSet).sort(),
            brands: Array.from(brandsSet).sort(),
            agents: Array.from(agentsSet).sort()
        };
    }, [equipmentDatabase]);

    // Filter equipment based on search and filters
    const filteredEquipments = useMemo(() => {
        return equipmentDatabase.filter(eq => {
            // Search term (searches in multiple fields)
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const matchesSearch =
                    eq.barcode_id?.toLowerCase().includes(term) ||
                    eq.brand?.toLowerCase().includes(term) ||
                    eq.model?.toLowerCase().includes(term) ||
                    eq.equipment_type?.toLowerCase().includes(term) ||
                    eq.agent_name?.toLowerCase().includes(term) ||
                    eq.serial_number?.toLowerCase().includes(term);

                if (!matchesSearch) return false;
            }

            // Type filter
            if (typeFilter && eq.equipment_type !== typeFilter) return false;

            // Brand filter
            if (brandFilter && eq.brand !== brandFilter) return false;

            // Agent filter
            if (agentFilter && eq.agent_name !== agentFilter) return false;

            return true;
        });
    }, [equipmentDatabase, searchTerm, typeFilter, brandFilter, agentFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setTypeFilter('');
        setBrandFilter('');
        setAgentFilter('');
    };

    if (!databaseMeta) {
        return (
            <div className="search-page">
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h2>Aucune base d'équipements</h2>
                    <p>Importez une base de données CSV depuis les paramètres pour commencer à rechercher des équipements.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="search-page">
            <div className="page-header">
                <h1>Recherche d'équipements</h1>
                <p className="header-subtitle">
                    {databaseMeta.totalItems} équipement{databaseMeta.totalItems > 1 ? 's' : ''} dans la base
                </p>
            </div>

            <div className="search-filters">
                <input
                    type="search"
                    className="search-input"
                    placeholder="🔍 Rechercher par code, marque, modèle, agent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="filter-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="">Tous les types</option>
                    {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                >
                    <option value="">Toutes les marques</option>
                    {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                    ))}
                </select>

                {/* Custom Searchable Agent Filter */}
                <div className="agent-filter-container">
                    <button
                        className={`filter-select agent-select-btn ${agentFilter ? 'active' : ''}`}
                        onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                    >
                        {agentFilter || "Tous les agents"}
                        <span className="arrow">▼</span>
                    </button>

                    {isAgentDropdownOpen && (
                        <div className="agent-dropdown">
                            <input
                                type="text"
                                className="agent-search-input"
                                placeholder="Rechercher un agent..."
                                value={agentSearchTerm}
                                onChange={(e) => setAgentSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="agent-list">
                                <div
                                    className={`agent-option ${agentFilter === '' ? 'selected' : ''}`}
                                    onClick={() => {
                                        setAgentFilter('');
                                        setIsAgentDropdownOpen(false);
                                        setAgentSearchTerm('');
                                    }}
                                >
                                    Tous les agents
                                </div>
                                {agents
                                    .filter(agent => agent.toLowerCase().includes(agentSearchTerm.toLowerCase()))
                                    .map(agent => (
                                        <div
                                            key={agent}
                                            className={`agent-option ${agentFilter === agent ? 'selected' : ''}`}
                                            onClick={() => {
                                                setAgentFilter(agent);
                                                setIsAgentDropdownOpen(false);
                                                setAgentSearchTerm('');
                                            }}
                                        >
                                            {agent}
                                        </div>
                                    ))
                                }
                                {agents.filter(agent => agent.toLowerCase().includes(agentSearchTerm.toLowerCase())).length === 0 && (
                                    <div className="no-agent-found">Aucun agent trouvé</div>
                                )}
                            </div>
                        </div>
                    )}
                    {isAgentDropdownOpen && (
                        <div className="dropdown-overlay" onClick={() => setIsAgentDropdownOpen(false)} />
                    )}
                </div>

                {(searchTerm || typeFilter || brandFilter || agentFilter) && (
                    <button className="btn-clear-filters" onClick={handleClearFilters}>
                        ✕ Réinitialiser
                    </button>
                )}
            </div>

            <div className="search-results">
                <p className="results-count">
                    {filteredEquipments.length} résultat{filteredEquipments.length > 1 ? 's' : ''}
                </p>

                {filteredEquipments.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>Aucun résultat</h3>
                        <p>Essayez de modifier vos critères de recherche</p>
                    </div>
                ) : (
                    <div className="equipment-grid">
                        {filteredEquipments.map((equipment, index) => (
                            <div
                                key={index}
                                className="equipment-card"
                                onClick={() => setSelectedEquipment(equipment)}
                            >
                                <span className="eq-icon">
                                    {getEquipmentIcon(equipment.equipment_type)}
                                </span>
                                <div className="eq-info">
                                    <h3>{equipment.brand} {equipment.model}</h3>
                                    <p className="eq-type">{equipment.equipment_type}</p>
                                    <p className="eq-code">{equipment.barcode_id}</p>
                                    {equipment.agent_name && (
                                        <p className="eq-agent">👤 {equipment.agent_name}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedEquipment && (
                <EquipmentModal
                    equipment={selectedEquipment}
                    onClose={() => setSelectedEquipment(null)}
                />
            )}
        </div>
    );
};

export default SearchPage;
