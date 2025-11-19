import { useState, useEffect } from 'react'
import CameraCapture from './components/CameraCapture'
import ScreenList from './components/ScreenList'
import './App.css'

function App() {
  const [screens, setScreens] = useState([])
  const [showCamera, setShowCamera] = useState(false)

  // Charger les écrans depuis localStorage au démarrage
  useEffect(() => {
    const savedScreens = localStorage.getItem('ocr-screens')
    if (savedScreens) {
      try {
        setScreens(JSON.parse(savedScreens))
      } catch (e) {
        console.error('Erreur lors du chargement des écrans:', e)
      }
    }
  }, [])

  // Sauvegarder les écrans dans localStorage
  useEffect(() => {
    if (screens.length >= 0) {
      localStorage.setItem('ocr-screens', JSON.stringify(screens))
    }
  }, [screens])

  const handleAddScreen = (screenId) => {
    if (screenId && !screens.find(s => s.id === screenId)) {
      const newScreen = {
        id: screenId,
        date: new Date().toISOString()
      }
      setScreens([...screens, newScreen])
      setShowCamera(false)
    }
  }

  const handleRemoveScreen = (screenId) => {
    setScreens(screens.filter(s => s.id !== screenId))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📱 OCR Scan</h1>
        <p className="subtitle">Gestion d'écrans par identifiant</p>
      </header>

      {!showCamera ? (
        <div className="main-content">
          <button 
            className="btn-primary"
            onClick={() => setShowCamera(true)}
          >
            📷 Scanner un écran
          </button>
          
          <ScreenList 
            screens={screens}
            onRemove={handleRemoveScreen}
          />
        </div>
      ) : (
        <CameraCapture 
          onScanComplete={handleAddScreen}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}

export default App

