import React from 'react';
import './ScannerSettings.css';

const ScannerSettings = ({ settings, onUpdate, onBack, embedded = false }) => {

    const handleChange = (key, value) => {
        onUpdate({ ...settings, [key]: value });
    };

    const handleFormatToggle = (format) => {
        const currentFormats = settings.formats || [];
        if (currentFormats.includes(format)) {
            handleChange('formats', currentFormats.filter(f => f !== format));
        } else {
            handleChange('formats', [...currentFormats, format]);
        }
    };

    return (
        <div className={`settings-container ${embedded ? 'embedded' : ''}`}>
            {!embedded && (
                <div className="settings-header">
                    <h2>Scanner Settings</h2>
                    <button className="btn-close" onClick={onBack}>✕</button>
                </div>
            )}

            <div className="settings-section">
                <h3>Detection Engine</h3>
                <div className="radio-group vertical">
                    <label className={`radio-option ${settings.detectionEngine === 'native' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            checked={settings.detectionEngine === 'native'}
                            onChange={() => handleChange('detectionEngine', 'native')}
                        />
                        <div className="option-content">
                            <span className="option-title">Native API (Android/Chrome)</span>
                            <span className="option-desc">Fastest, uses device hardware.</span>
                        </div>
                    </label>
                    <label className={`radio-option ${settings.detectionEngine === 'zbar' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            checked={settings.detectionEngine === 'zbar'}
                            onChange={() => handleChange('detectionEngine', 'zbar')}
                        />
                        <div className="option-content">
                            <span className="option-title">ZBar (WASM)</span>
                            <span className="option-desc">Robust for iOS. Good for 1D codes.</span>
                        </div>
                    </label>
                    <label className={`radio-option ${settings.detectionEngine === 'quagga' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            checked={settings.detectionEngine === 'quagga'}
                            onChange={() => handleChange('detectionEngine', 'quagga')}
                        />
                        <div className="option-content">
                            <span className="option-title">Quagga2 (JS)</span>
                            <span className="option-desc">Specialized for 1D barcodes (Code 128).</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h3>Barcode Formats</h3>
                <div className="checkbox-grid">
                    {['code_128', 'code_39', 'ean_13', 'qr_code', 'upc_a'].map(fmt => (
                        <label key={fmt} className="checkbox-option">
                            <input
                                type="checkbox"
                                checked={settings.formats?.includes(fmt)}
                                onChange={() => handleFormatToggle(fmt)}
                            />
                            {fmt.replace('_', ' ').toUpperCase()}
                        </label>
                    ))}
                </div>
            </div>

            <div className="settings-section">
                <h3>Camera Resolution</h3>
                <select
                    value={settings.resolution}
                    onChange={(e) => handleChange('resolution', e.target.value)}
                    className="settings-select"
                >
                    <option value="480">480p (Fastest)</option>
                    <option value="720">720p (Balanced)</option>
                    <option value="1080">1080p (High Detail)</option>
                    <option value="2160">4K (Max Detail)</option>
                </select>
            </div>

            <div className="settings-section">
                <h3>Scan Interval (ms)</h3>
                <div className="range-control">
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={settings.scanInterval}
                        onChange={(e) => handleChange('scanInterval', parseInt(e.target.value))}
                    />
                    <span>{settings.scanInterval} ms</span>
                </div>
                <p className="setting-hint">Higher interval = less CPU usage, slower detection.</p>
            </div>

            <div className="settings-section">
                <h3>Feedback & UI</h3>
                <label className="toggle-option">
                    <span>Vibrate on Scan</span>
                    <input
                        type="checkbox"
                        checked={settings.vibrate}
                        onChange={(e) => handleChange('vibrate', e.target.checked)}
                    />
                </label>
                <label className="toggle-option">
                    <span>Show Bounding Box</span>
                    <input
                        type="checkbox"
                        checked={settings.showBoundingBox}
                        onChange={(e) => handleChange('showBoundingBox', e.target.checked)}
                    />
                </label>
            </div>

            {!embedded && (
                <button className="btn-save" onClick={onBack}>Save & Return</button>
            )}
        </div>
    );
};


export default ScannerSettings;
