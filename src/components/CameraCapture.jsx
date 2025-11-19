import { useState, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import './CameraCapture.css'

function CameraCapture({ onScanComplete, onCancel }) {
  const [stream, setStream] = useState(null)
  const [detectedId, setDetectedId] = useState(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(true)
  const videoRef = useRef(null)
  const codeReaderRef = useRef(null)
  const scanControllerRef = useRef(null)

  // Démarrer la caméra et la détection
  useEffect(() => {
    let mediaStream = null
    
    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Caméra arrière sur mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
        setStream(mediaStream)
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          
          // Attendre que la vidéo soit prête
          videoRef.current.onloadedmetadata = async () => {
            await startScanning()
          }
        }
      } catch (err) {
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
        console.error('Erreur caméra:', err)
        setScanning(false)
      }
    }

    startCamera()

    return () => {
      stopScanning()
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startScanning = async () => {
    if (!videoRef.current || codeReaderRef.current || !scanning) return

    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader

    try {
      const controller = await codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText()
            
            // Vérifier si c'est un identifiant à 7 chiffres
            const sevenDigitMatch = text.match(/^\d{7}$/)
            if (sevenDigitMatch) {
              setDetectedId(sevenDigitMatch[0])
              setScanning(false)
              stopScanning()
            } else {
              // Essayer d'extraire 7 chiffres du texte
              const digits = text.replace(/\D/g, '')
              if (digits.length >= 7) {
                const id = digits.substring(0, 7)
                setDetectedId(id)
                setScanning(false)
                stopScanning()
              }
            }
          }
          
          if (error && error.name !== 'NotFoundException') {
            // Ignorer les erreurs "pas de code trouvé" (c'est normal)
            console.debug('Scan error:', error)
          }
        }
      )
      scanControllerRef.current = controller
    } catch (err) {
      console.error('Erreur scan:', err)
      setError('Erreur lors de l\'initialisation du scanner')
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (e) {
        console.debug('Erreur reset:', e)
      }
      codeReaderRef.current = null
    }
    if (scanControllerRef.current) {
      scanControllerRef.current = null
    }
  }

  const handleRetry = async () => {
    setDetectedId(null)
    setError(null)
    setScanning(true)
    stopScanning()
    // Attendre un peu avant de redémarrer
    setTimeout(() => {
      startScanning()
    }, 100)
  }

  const handleConfirm = () => {
    if (detectedId) {
      stopScanning()
      onScanComplete(detectedId)
    }
  }

  return (
    <div className="camera-capture">
      <div className="camera-header">
        <button className="btn-cancel" onClick={onCancel}>
          ✕ Annuler
        </button>
        <h2>Scanner un code-barres</h2>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="camera-view">
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-preview"
          />
          
          {/* Overlay de scan */}
          <div className="scan-overlay">
            <div className="scan-frame">
              <div className="scan-corner scan-corner-tl"></div>
              <div className="scan-corner scan-corner-tr"></div>
              <div className="scan-corner scan-corner-bl"></div>
              <div className="scan-corner scan-corner-br"></div>
              <div className="scan-line"></div>
            </div>
            <p className="scan-instruction">
              {scanning ? 'Pointez la caméra vers le code-barres' : 'Code détecté !'}
            </p>
          </div>
        </div>

        {detectedId ? (
          <div className="detected-result">
            <div className="detected-id">
              <h3>Identifiant détecté:</h3>
              <div className="id-display">{detectedId}</div>
            </div>
            <div className="result-controls">
              <button 
                className="btn-secondary"
                onClick={handleRetry}
              >
                🔄 Réessayer
              </button>
              <button 
                className="btn-success"
                onClick={handleConfirm}
              >
                ✓ Confirmer
              </button>
            </div>
          </div>
        ) : (
          <div className="scanning-hint">
            <p>📷 Recherche de code-barres en cours...</p>
            <p className="hint-text">Assurez-vous que le code est bien visible et éclairé</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CameraCapture
