import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './ScannerSettings.css';

const ScannerSettings = ({ settings, onUpdate, onBack, embedded = false }) => {
    const [cameras, setCameras] = useState([]);
    const [loadingCameras, setLoadingCameras] = useState(true);

    useEffect(() => {
        // Charger la liste des caméras disponibles
        const loadCameras = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                setCameras(devices);
            } catch (err) {
                console.error('Erreur chargement caméras:', err);
            } finally {
                setLoadingCameras(false);
            }
        };
        loadCameras();
    }, []);

    const handleChange = (key, value) => {
        onUpdate({ ...settings, [key]: value });
    };

    return (
        <div className={`settings-container ${embedded ? 'embedded' : ''}`}>
            {!embedded && (
                <div className="settings-header">
                    <h2>Paramètres du Scanner</h2>
                    <button className="btn-close" onClick={onBack}>✕</button>
                </div>
            )}

            <div className="settings-section">
                <h3>⚙️ Scanner Code 128</h3>
                <p className="section-description">
                    Scanner optimisé pour les codes <strong>Code 128</strong> avec caméra arrière
                </p>
            </div>

            <div className="settings-section">
                <h3>Vitesse de Scan (FPS)</h3>
                <div className="range-control">
                    <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={settings.fps || 10}
                        onChange={(e) => handleChange('fps', parseInt(e.target.value))}
                    />
                    <span className="range-value">{settings.fps || 10} fps</span>
                </div>
                <p className="setting-hint">Plus élevé = détection plus rapide mais plus de batterie</p>
            </div>

            <div className="settings-section">
                <h3>Taille de la Zone de Scan</h3>
                <div className="range-control">
                    <input
                        type="range"
                        min="150"
                        max="350"
                        step="25"
                        value={settings.qrbox || 250}
                        onChange={(e) => handleChange('qrbox', parseInt(e.target.value))}
                    />
                    <span className="range-value">{settings.qrbox || 250}px</span>
                </div>
                <p className="setting-hint">Taille de la zone de détection du code-barres</p>
            </div>

            <div className="settings-section">
                <h3>Format de la Zone</h3>
                <select
                    value={settings.aspectRatio || 1.0}
                    onChange={(e) => handleChange('aspectRatio', parseFloat(e.target.value))}
                    className="settings-select"
                >
                    <option value="1.0">Carré (1:1)</option>
                    <option value="1.33">Standard (4:3)</option>
                    <option value="1.77">Large (16:9)</option>
                </select>
                <p className="setting-hint">Ratio de la zone de scan</p>
            </div>

            <div className="settings-section">
                <h3>📹 Caméra</h3>
                {loadingCameras ? (
                    <p className="setting-hint">Chargement des caméras...</p>
                ) : cameras.length > 0 ? (
                    <>
                        <select
                            value={settings.cameraId || ''}
                            onChange={(e) => handleChange('cameraId', e.target.value)}
                            className="settings-select"
                        >
                            <option value="">Caméra automatique</option>
                            {cameras.map((camera) => (
                                <option key={camera.id} value={camera.id}>
                                    {camera.label || `Caméra ${camera.id.substring(0, 8)}...`}
                                </option>
                            ))}
                        </select>
                        <p className="setting-hint">
                            {cameras.length} caméra(s) détectée(s). Par défaut, la caméra arrière est utilisée.
                        </p>
                    </>
                ) : (
                    <p className="setting-hint">Aucune caméra détectée</p>
                )}
            </div>

            <div className="settings-section">
                <h3>Retour Haptique</h3>
                <label className="toggle-option">
                    <span>Vibrer lors de la détection</span>
                    <input
                        type="checkbox"
                        checked={settings.vibrate !== false}
                        onChange={(e) => handleChange('vibrate', e.target.checked)}
                    />
                </label>
            </div>

            {!embedded && (
                <button className="btn-save" onClick={onBack}>Enregistrer et Retourner</button>
            )}
        </div>
    );
};


export default ScannerSettings;
