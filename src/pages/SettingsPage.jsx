import { useState } from 'react';
import ScannerSettings from '../components/ScannerSettings';
import EquipmentManager from '../components/EquipmentManager';
import { clearAllData } from '../utils/storage';
import './SettingsPage.css';

const SettingsPage = ({ settings, onUpdateSettings }) => {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const handleResetData = () => {
        if (confirm('⚠️ Attention ! Cette action supprimera TOUS les inventaires et données de l\'application.\n\nÊtes-vous sûr de vouloir continuer ?')) {
            if (clearAllData()) {
                alert('✓ Toutes les données ont été réinitialisées.');
                window.location.reload();
            } else {
                alert('❌ Erreur lors de la réinitialisation.');
            }
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1>Paramètres</h1>
            </div>

            <div className="settings-sections">
                {/* Section Données */}
                <div className="collapsible-section">
                    <button
                        className={`collapsible-header ${openSection === 'data' ? 'active' : ''}`}
                        onClick={() => toggleSection('data')}
                    >
                        <h2>📊 Gestion des données</h2>
                        <span className="arrow">{openSection === 'data' ? '▲' : '▼'}</span>
                    </button>

                    {openSection === 'data' && (
                        <div className="collapsible-content">
                            <EquipmentManager />

                            <div className="setting-card danger">
                                <div className="setting-info">
                                    <h3>Réinitialiser toutes les données</h3>
                                    <p>Supprime définitivement tous les inventaires et données de l'application</p>
                                </div>
                                <button className="btn-danger" onClick={handleResetData}>
                                    🗑️ Réinitialiser
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section Scanner */}
                <div className="collapsible-section">
                    <button
                        className={`collapsible-header ${openSection === 'scanner' ? 'active' : ''}`}
                        onClick={() => toggleSection('scanner')}
                    >
                        <h2>📷 Configuration du scanner</h2>
                        <span className="arrow">{openSection === 'scanner' ? '▲' : '▼'}</span>
                    </button>

                    {openSection === 'scanner' && (
                        <div className="collapsible-content">
                            <div className="scanner-settings-wrapper">
                                <ScannerSettings
                                    settings={settings}
                                    onUpdate={onUpdateSettings}
                                    embedded={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default SettingsPage;
