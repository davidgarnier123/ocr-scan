import { useState } from 'react';
import {
    saveEquipmentDatabase,
    saveDatabaseMeta,
    getDatabaseMeta,
    clearEquipmentDatabase
} from '../utils/storage';
import './EquipmentManager.css';

const EquipmentManager = () => {
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
    const [databaseMeta, setDatabaseMeta] = useState(() => getDatabaseMeta());

    /**
     * Parse un fichier CSV selon le format défini
     * @param {string} csvText - Contenu du fichier CSV
     * @returns {Array} Liste des équipements parsés
     */
    const parseCSV = (csvText) => {
        try {
            const lines = csvText.split('\n').filter(line => line.trim());
            if (lines.length < 1) {
                throw new Error('Le fichier CSV doit contenir au moins une ligne de données');
            }

            // Détection automatique de l'en-tête
            const firstLine = lines[0].toLowerCase();
            const hasHeader = firstLine.includes('marque') ||
                firstLine.includes('type') ||
                firstLine.includes('modèle');

            // Ignorer l'en-tête si présent
            const dataLines = hasHeader ? lines.slice(1) : lines;

            // Parser chaque ligne
            const data = dataLines.map((line, index) => {
                const values = line.split(';').map(v => v.trim());

                return {
                    barcode_id: values[10] || '',      // ID interne = CODE-BARRES
                    brand: values[0] || '',
                    equipment_type: values[1] || '',
                    model: values[2] || '',
                    serial_number: values[3] || '',
                    org_path: values[4] || '',
                    agent_name: values[5] || '',
                    acquisition_date: values[6] || '',
                    ip_address: values[7] || '',
                    mac_address: values[8] || '',
                    code: values[9] || '',
                    internal_id: values[10] || '',
                    extra_info: values[11] || '',
                    connected_to: values[12] || ''
                };
            }).filter(item => item.barcode_id); // Filtrer les lignes vides

            if (data.length === 0) {
                throw new Error('Aucune donnée valide trouvée dans le fichier CSV');
            }

            return data;
        } catch (error) {
            throw new Error(`Erreur de parsing: ${error.message}`);
        }
    };

    /**
     * Gère l'upload du fichier CSV
     */
    const handleFileUpload = (file) => {
        if (!file) {
            setUploadStatus({ type: 'error', message: 'Veuillez sélectionner un fichier' });
            return;
        }

        if (!file.name.endsWith('.csv')) {
            setUploadStatus({ type: 'error', message: 'Veuillez sélectionner un fichier CSV' });
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const parsedData = parseCSV(csvText);

                // Sauvegarder dans localStorage
                saveEquipmentDatabase(parsedData);

                // Sauvegarder les métadonnées
                const meta = {
                    uploadDate: new Date().toISOString(),
                    totalItems: parsedData.length,
                    fileName: file.name
                };
                saveDatabaseMeta(meta);
                setDatabaseMeta(meta);

                setUploadStatus({
                    type: 'success',
                    message: `✓ ${parsedData.length} équipement(s) importé(s) avec succès`
                });
            } catch (error) {
                setUploadStatus({ type: 'error', message: error.message });
            }
        };

        reader.onerror = () => {
            setUploadStatus({ type: 'error', message: 'Erreur lors de la lecture du fichier' });
        };

        reader.readAsText(file, 'UTF-8');
    };

    /**
     * Télécharge un fichier CSV template
     */
    const downloadSampleCSV = () => {
        const header = 'Marque;Type;Modèle;Numéro de série;Chemin organisationnel;Agent;Date acquisition;IP;MAC;Code;ID interne;Info;Connecté à\n';
        const sample = 'LENOVO;Ordinateur;Thinkpad E595;PF2D0J69;/Services/IT/Paris;Dupont Jean;2020/09/29;10.76.51.173;00:2B:67:B2:6E:8E;Z017-1905374;1905374;;\n' +
            'ALCATEL;Téléphone;8028S;FUM212412616;/Services/IT/Paris;Dupont Jean;2021/11/04;;48:7A:55:1C:29:85;;1908623;;\n' +
            'Philips;Moniteur;242S9JML/00;UK02443026503;/Services/IT/Lyon;Martin Marie;2025/02/14;;;;2292034;;1905374';

        const csvContent = header + sample;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'template_equipments.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    /**
     * Efface la base de données des équipements
     */
    const handleClearDatabase = () => {
        if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer la base d\'équipements ?')) {
            if (clearEquipmentDatabase()) {
                setDatabaseMeta(null);
                setUploadStatus({ type: 'success', message: '✓ Base d\'équipements supprimée' });
            } else {
                setUploadStatus({ type: 'error', message: '❌ Erreur lors de la suppression' });
            }
        }
    };

    return (
        <div className="equipment-manager">
            <div className="setting-card">
                <div className="setting-info">
                    <h3>📥 Import base d'équipements</h3>
                    <p>Importez un fichier CSV contenant la liste de vos équipements avec leurs identifiants (codes-barres)</p>
                </div>
                <div className="upload-actions">
                    <label htmlFor="csv-upload" className="btn-primary">
                        📂 Choisir un fichier CSV
                    </label>
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                    <button className="btn-secondary" onClick={downloadSampleCSV}>
                        📄 Template CSV
                    </button>
                </div>
            </div>

            {uploadStatus.message && (
                <div className={`upload-status ${uploadStatus.type}`}>
                    {uploadStatus.message}
                </div>
            )}

            {databaseMeta && (
                <div className="setting-card database-info">
                    <h3>📊 Base de données actuelle</h3>
                    <div className="meta-grid">
                        <div className="meta-item">
                            <span className="meta-label">Équipements</span>
                            <span className="meta-value">{databaseMeta.totalItems}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Fichier</span>
                            <span className="meta-value">{databaseMeta.fileName}</span>
                        </div>
                        <div className="meta-item full-width">
                            <span className="meta-label">Date d'import</span>
                            <span className="meta-value">
                                {new Date(databaseMeta.uploadDate).toLocaleString('fr-FR')}
                            </span>
                        </div>
                    </div>
                    <button className="btn-danger-outline" onClick={handleClearDatabase}>
                        🗑️ Supprimer la base
                    </button>
                </div>
            )}
        </div>
    );
};

export default EquipmentManager;
