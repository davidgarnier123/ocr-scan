import { useState, useMemo } from 'react';
import { getEquipmentDatabase, getDatabaseMeta } from '../utils/storage';
import EquipmentModal, { getEquipmentIcon } from '../components/EquipmentModal';
import './SearchPage.css';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    const equipmentDatabase = getEquipmentDatabase();
    const databaseMeta = getDatabaseMeta();

    // Extract unique values for filters
    const { types, brands } = useMemo(() => {
        const typesSet = new Set();
        const brandsSet = new Set();

        equipmentDatabase.forEach(eq => {
            if (eq.equipment_type) typesSet.add(eq.equipment_type);
            if (eq.brand) brandsSet.add(eq.brand);
        });

        return {
            types: Array.from(typesSet).sort(),
            brands: Array.from(brandsSet).sort()
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

            return true;
        });
    }, [equipmentDatabase, searchTerm, typeFilter, brandFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredEquipments.length / ITEMS_PER_PAGE);
    const paginatedEquipments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredEquipments.slice(startIndex, endIndex);
    }, [filteredEquipments, currentPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter, brandFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setTypeFilter('');
        setBrandFilter('');
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <h1>Recherche</h1>
                <p className="header-subtitle">
                    {databaseMeta.totalItems} équipement{databaseMeta.totalItems > 1 ? 's' : ''}
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
                {searchTerm && (
                    <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                        ✕
                    </button>
                )}
            </div>

            <div className="search-results">
                <div className="results-header">
                    <p className="results-count">
                        {filteredEquipments.length} résultat{filteredEquipments.length > 1 ? 's' : ''}
                        {filteredEquipments.length > ITEMS_PER_PAGE && (
                            <span className="page-info"> • Page {currentPage}/{totalPages}</span>
                        )}
                    </p>
                </div>

                {filteredEquipments.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>Aucun résultat</h3>
                        <p>Essayez de modifier vos critères de recherche</p>
                    </div>
                ) : (
                    <>
                        <div className="equipment-grid">
                            {paginatedEquipments.map((equipment, index) => (
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

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn-page"
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                >
                                    ← Précédent
                                </button>
                                <span className="page-indicator">
                                    Page {currentPage} / {totalPages}
                                </span>
                                <button
                                    className="btn-page"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant →
                                </button>
                            </div>
                        )}
                    </>
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
