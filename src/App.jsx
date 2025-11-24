import { useState } from 'react'
import BarcodeScanner from './components/BarcodeScanner'
import ScannerSettings from './components/ScannerSettings'
import './App.css'

function App() {
  const [scannedCodes, setScannedCodes] = useState([])
  const [view, setView] = useState('scanner'); // 'scanner' or 'settings'
  const [settings, setSettings] = useState({
    useNative: true,
    formats: ['code_128', 'code_39'],
    resolution: '1080',
    scanInterval: 100,
    showBoundingBox: true,
    vibrate: true
  });

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

  return (
    <div className="app-container">
      {view === 'scanner' ? (
        <>
          <BarcodeScanner
            onScan={handleScan}
            settings={settings}
          />

          <button
            className="btn-settings-float"
            onClick={() => setView('settings')}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 100,
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ⚙️
          </button>

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
      ) : (
        <ScannerSettings
          settings={settings}
          onUpdate={setSettings}
          onBack={() => setView('scanner')}
        />
      )}
    </div>
  )
}

export default App
