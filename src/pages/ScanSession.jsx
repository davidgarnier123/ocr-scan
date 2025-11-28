import { useState, useEffect } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import AgentSelector from '../components/AgentSelector';
import EquipmentModal, { getEquipmentIcon } from '../components/EquipmentModal';
import { getCurrentSession, saveCurrentSession, clearCurrentSession, getEquipmentById } from '../utils/storage';
import './ScanSession.css';

const ScanSession = ({ settings, onInventoryCreated }) => {
    const [scannedCodes, setScannedCodes] = useState(() => getCurrentSession());
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [notes, setNotes] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [manualCode, setManualCode] = useState('');

    // Sauvegarder la session à chaque changement
    useEffect(() => {
        saveCurrentSession(scannedCodes);
    }, [scannedCodes]);

    const handleScan = (code) => {
        setScannedCodes(prev => {
            if (prev.includes(code)) return prev;
            return [...prev, code];
        });
    };

    const handleManualAdd = () => {
        const code = manualCode.trim();
        // Valider que c'est un nombre à 7 chiffres
        if (!/^\d{7}$/.test(code)) {
            alert('Veuillez entrer un code à 7 chiffres');
            return;
        }
        handleScan(code);
        setManualCode('');
    };

    const handleRemoveCode = (index) => {
        setScannedCodes(prev => prev.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        if (confirm('Êtes-vous sûr de vouloir effacer tous les codes scannés ?')) {
            setScannedCodes([]);
            clearCurrentSession();
        }
    };

    const handleValidate = () => {
        if (scannedCodes.length === 0) {
            alert('Veuillez scanner au moins un équipement avant de valider.');
            return;
        }
        setShowValidationModal(true);
    };

    const handleConfirmValidation = () => {
        if (!selectedAgent) {
            alert('Veuillez sélectionner un agent.');
            return;
        }

        const inventory = {
            agent: selectedAgent,
            devices: scannedCodes,
            notes: notes.trim()
        };

        onInventoryCreated(inventory);

        // Réinitialiser
        setScannedCodes([]);
        clearCurrentSession();
        setSelectedAgent(null);
        setNotes('');
        setShowValidationModal(false);
    };

    const handleViewEquipment = (code) => {
        const equipment = getEquipmentById(code);
        if (equipment) {
            setSelectedEquipment(equipment);
        }
    };

    return (
        <div className="scan-session-page">
            <div className="scanner-container">
                <BarcodeScanner
                    onScan={handleScan}
                    settings={settings}
                />
            </div>

            {/* Input manuel */}
            <div className="manual-input-section">
                <div className="manual-input-container">
                    <input
                        type="text"
                        className="manual-code-input"
                        placeholder="Saisir un code à 7 chiffres"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 7))}
                        onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}
                        maxLength={7}
                        inputMode="numeric"
                    />
                    <button
                        className="btn-add-manual"
                        onClick={handleManualAdd}
                        disabled={manualCode.length !== 7}
                    >
                        <span className="btn-icon">+</span>
                        Ajouter
                    </button>
                </div>
            </div>

            {scannedCodes.length > 0 && (
                <div className="scanned-items">
                    <div className="scanned-header">
                        <h2>Équipements scannés ({scannedCodes.length})</h2>
                        <div className="header-actions">
                            <button className="btn-clear" onClick={handleClearAll}>
                                🗑️ Tout effacer
                            </button>
                            <button className="btn-validate" onClick={handleValidate}>
                                ✓ Finaliser
                            </button>
                        </div>
                    </div>

                    <div className="scanned-list">
                        {scannedCodes.map((code, index) => {
                            const equipment = getEquipmentById(code);
                            return (
                                <div
                                    key={index}
                                    className="scanned-item"
                                    onClick={() => equipment && handleViewEquipment(code)}
                                    style={{ cursor: equipment ? 'pointer' : 'default' }}
                                >
                                    <span className="item-number">#{index + 1}</span>
                                    {equipment && (
                                        <span className="item-icon" title={equipment.equipment_type}>
                                            {getEquipmentIcon(equipment.equipment_type)}
                                        </span>
                                    )}
                                    <div className="item-info">
                                        <span className="item-code">{code}</span>
                                        {equipment && (
                                            <span className="item-name">
                                                {equipment.brand} {equipment.model}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        className="btn-remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveCode(index);
                                        }}
                                        aria-label="Supprimer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showValidationModal && (
                <div className="modal-overlay" onClick={() => setShowValidationModal(false)}>
                    <div className="validation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Finaliser l'inventaire</h2>
                            <button
                                className="btn-close-modal"
                                onClick={() => setShowValidationModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="equipment-count">
                                <span className="count-number">{scannedCodes.length}</span>
                                <span className="count-label">équipement{scannedCodes.length > 1 ? 's' : ''} scanné{scannedCodes.length > 1 ? 's' : ''}</span>
                            </div>

                            <div className="form-section">
                                <label className="form-label">Agent assigné *</label>
                                <AgentSelector
                                    selectedAgent={selectedAgent}
                                    onSelect={setSelectedAgent}
                                />
                            </div>

                            <div className="form-section">
                                <label htmlFor="notes" className="form-label">Notes (optionnel)</label>
                                <textarea
                                    id="notes"
                                    className="notes-textarea"
                                    placeholder="Localisation, remarques..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-modal-cancel"
                                onClick={() => setShowValidationModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                className="btn-modal-confirm"
                                onClick={handleConfirmValidation}
                                disabled={!selectedAgent}
                            >
                                <span className="btn-icon">✓</span>
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedEquipment && (
                <EquipmentModal
                    equipment={selectedEquipment}
                    onClose={() => setSelectedEquipment(null)}
                />
            )}
        </div>
    );
};

export default ScanSession;

