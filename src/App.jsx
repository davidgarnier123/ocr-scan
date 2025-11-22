import { useState } from 'react'
import BarcodeScanner from './components/BarcodeScanner'
import './App.css'

function App() {
  const [scannedCodes, setScannedCodes] = useState([])

  const handleScan = (code) => {
    setScannedCodes(prev => {
      // Avoid duplicates if needed, or just add to top
      if (prev.includes(code)) return prev;
      return [code, ...prev];
    })
  }

  return (
    <div className="app-container">
      <BarcodeScanner onScan={handleScan} />

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
    </div>
  )
}

export default App
