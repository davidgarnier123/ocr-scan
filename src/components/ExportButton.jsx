import { useState, useRef, useEffect } from 'react';
import { exportToJSON, exportToCSV, exportToHTML } from '../utils/export';
import './ExportButton.css';

const ExportButton = ({ inventories, equipmentDatabase }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = (format) => {
        switch (format) {
            case 'json':
                exportToJSON(inventories);
                break;
            case 'csv':
                exportToCSV(inventories, equipmentDatabase);
                break;
            case 'html':
                exportToHTML(inventories, equipmentDatabase);
                break;
            default:
                break;
        }
        setShowMenu(false);
    };

    if (!inventories || inventories.length === 0) {
        return null;
    }

    return (
        <div className="export-button-wrapper" ref={menuRef}>
            <button
                className="export-button"
                onClick={() => setShowMenu(!showMenu)}
            >
                📥 Exporter
            </button>

            {showMenu && (
                <div className="export-menu">
                    <button
                        className="export-option"
                        onClick={() => handleExport('json')}
                    >
                        <span className="export-icon">📄</span>
                        <div className="export-info">
                            <div className="export-name">JSON</div>
                            <div className="export-desc">Données brutes</div>
                        </div>
                    </button>

                    <button
                        className="export-option"
                        onClick={() => handleExport('csv')}
                    >
                        <span className="export-icon">📊</span>
                        <div className="export-info">
                            <div className="export-name">CSV</div>
                            <div className="export-desc">Excel / Tableur</div>
                        </div>
                    </button>

                    <button
                        className="export-option"
                        onClick={() => handleExport('html')}
                    >
                        <span className="export-icon">🌐</span>
                        <div className="export-info">
                            <div className="export-name">HTML</div>
                            <div className="export-desc">Page web stylisée</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportButton;
