import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ScanSession from './pages/ScanSession';
import InventoryList from './pages/InventoryList';
import SettingsPage from './pages/SettingsPage';
import { getInventories, saveInventory, deleteInventory } from './utils/storage';
import './InventoryApp.css';

function InventoryApp() {
    const [currentPage, setCurrentPage] = useState('scanner');
    const [inventories, setInventories] = useState(() => getInventories());
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('scannerSettings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved settings", e);
            }
        }
        return {
            useNative: true,
            formats: ['code_128', 'code_39'],
            resolution: '1080',
            scanInterval: 100,
            showBoundingBox: true,
            vibrate: true
        };
    });

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('scannerSettings', JSON.stringify(settings));
    }, [settings]);

    const handleInventoryCreated = (inventory) => {
        if (saveInventory(inventory)) {
            setInventories(getInventories());
            // Vibrate on success
            if (settings.vibrate && navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
            alert('✓ Inventaire enregistré avec succès !');
        } else {
            alert('❌ Erreur lors de l\'enregistrement de l\'inventaire.');
        }
    };

    const handleDeleteInventory = (id) => {
        if (deleteInventory(id)) {
            setInventories(getInventories());
        } else {
            alert('❌ Erreur lors de la suppression.');
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'scanner':
                return (
                    <ScanSession
                        settings={settings}
                        onInventoryCreated={handleInventoryCreated}
                    />
                );
            case 'inventories':
                return (
                    <InventoryList
                        inventories={inventories}
                        onDelete={handleDeleteInventory}
                    />
                );
            case 'settings':
                return (
                    <SettingsPage
                        settings={settings}
                        onUpdateSettings={setSettings}
                    />
                );
            default:
                return <ScanSession settings={settings} onInventoryCreated={handleInventoryCreated} />;
        }
    };

    return (
        <div className="inventory-app">
            <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="app-main">
                {renderPage()}
            </main>
        </div>
    );
}

export default InventoryApp;
