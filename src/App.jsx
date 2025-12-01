import { useState, useEffect } from 'react'
import BarcodeScanner from './components/BarcodeScanner'
import ScannerSettings from './components/ScannerSettings'
import InventoryList from './pages/InventoryList'
import SearchPage from './pages/SearchPage'
import ConsultationPage from './pages/ConsultationPage'
import Navigation from './components/Navigation'
import { getInventories, deleteInventory } from './utils/storage'
import './App.css'

function App() {
  const [scannedCodes, setScannedCodes] = useState([])
  const [view, setView] = useState('scanner'); // 'scanner', 'settings', 'inventories', 'search', 'consultation'
  const [inventories, setInventories] = useState([]);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('scannerSettings');
    let initialSettings = saved ? JSON.parse(saved) : {
      fps: 10,
      qrbox: 250,
      aspectRatio: 1.0,
      resolution: '1080',
      vibrate: true
    };

    // Migration: Remove old settings that are no longer used
    if (initialSettings.detectionEngine !== undefined) {
      delete initialSettings.detectionEngine;
    }
    if (initialSettings.formats !== undefined) {
      delete initialSettings.formats;
    }
    if (initialSettings.scanInterval !== undefined) {
      delete initialSettings.scanInterval;
    }
    if (initialSettings.showBoundingBox !== undefined) {
      delete initialSettings.showBoundingBox;
    }
    if (initialSettings.useNative !== undefined) {
      delete initialSettings.useNative;
    }

    // Set defaults for new settings if missing
    if (initialSettings.fps === undefined) {
      initialSettings.fps = 10;
    }
    if (initialSettings.qrbox === undefined) {
      initialSettings.qrbox = 250;
    }
    if (initialSettings.aspectRatio === undefined) {
      initialSettings.aspectRatio = 1.0;
    }

    return initialSettings;
  });

  // Load inventories on mount and when view changes to inventories
  useEffect(() => {
    if (view === 'inventories') {
      setInventories(getInventories());
    }
  }, [view]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scannerSettings', JSON.stringify(settings));
  }, [settings]);

  const handleScan = (code) => {
    setScannedCodes(prev => {
      if (prev.includes(code)) return prev;
      // Vibrate if enabled
      if (settings.vibrate && navigator.vibrate) {
        navigator.vibrate(200);
      }
      return [code, ...prev];
    })
  }

  const handleDeleteInventory = (id) => {
    if (deleteInventory(id)) {
      setInventories(getInventories());
    }
  };

  const renderView = () => {
    switch (view) {
      case 'scanner':
        return (
          <>
            <BarcodeScanner
              onScan={handleScan}
              settings={settings}
            />
            {scannedCodes.length > 0 && (
              <div className="scanned-list-overlay">
                <h3>Scanned Codes</h3>
                <ul>
                  {scannedCodes.map((code, index) => (
                    <li key={index}>{code}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        );
      case 'settings':
        return (
          <ScannerSettings
            settings={settings}
            onUpdate={setSettings}
            onBack={() => setView('scanner')}
          />
        );
      case 'inventories':
        return (
          <InventoryList
            inventories={inventories}
            onDelete={handleDeleteInventory}
          />
        );
      case 'search':
        return <SearchPage />;
      case 'consultation':
        return <ConsultationPage />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="app-container">
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, background: 'red', color: 'white', padding: '4px', fontSize: '10px' }}>
        Debug View: {view}
      </div>
      {renderView()}

      {view !== 'settings' && (
        <Navigation
          currentPage={view}
          onNavigate={setView}
        />
      )}
    </div>
  )
}

export default App
