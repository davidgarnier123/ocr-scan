import ScannerSettings from '../components/ScannerSettings';
import { clearAllData } from '../utils/storage';
import './SettingsPage.css';

const SettingsPage = ({ settings, onUpdateSettings }) => {
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
                <section className="settings-section">
                    <h2>📊 Gestion des données</h2>

                    <div className="setting-card">
                        <div className="setting-info">
                            <h3>Import données devices</h3>
                            <p>Importez les informations détaillées de votre parc informatique (ordinateurs, écrans, téléphones, etc.)</p>
                        </div>
                        <button className="btn-secondary" disabled>
                            Bientôt disponible
                        </button>
                    </div>

                    <div className="setting-card">
                        <div className="setting-info">
                            <h3>Import liste des agents</h3>
                            <p>Importez la liste des agents avec leurs services pour une attribution plus précise</p>
                        </div>
                        <button className="btn-secondary" disabled>
                            Bientôt disponible
                        </button>
                    </div>

                    <div className="setting-card danger">
                        <div className="setting-info">
                            <h3>Réinitialiser toutes les données</h3>
                            <p>Supprime définitivement tous les inventaires et données de l'application</p>
                        </div>
                        <button className="btn-danger" onClick={handleResetData}>
                            🗑️ Réinitialiser
                        </button>
                    </div>
                </section>

                {/* Section Scanner */}
                <section className="settings-section">
                    <h2>📷 Configuration du scanner</h2>
                    <div className="scanner-settings-wrapper">
                        <ScannerSettings
                            settings={settings}
                            onUpdate={onUpdateSettings}
                            embedded={true}
                        />
                    </div>
                </section>

                {/* Section À propos */}
                <section className="settings-section">
                    <h2>ℹ️ À propos</h2>
                    <div className="setting-card">
                        <div className="about-content">
                            <h3>Application d'Inventaire Parc Informatique</h3>
                            <p><strong>Version:</strong> 1.0.0</p>
                            <p><strong>Description:</strong> Application de gestion d'inventaire par scan de codes-barres pour le suivi des équipements informatiques.</p>
                            <p className="about-note">
                                Cette application utilise le stockage local du navigateur. Aucune donnée n'est envoyée vers un serveur externe.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
