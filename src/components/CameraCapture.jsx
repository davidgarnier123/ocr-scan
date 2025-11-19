import { useState, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library'
import './CameraCapture.css'

function CameraCapture({ onScanComplete, onCancel }) {
  const [stream, setStream] = useState(null)
  const [detectedId, setDetectedId] = useState(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const codeReaderRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastScanTimeRef = useRef(0)

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
          videoRef.current.onloadedmetadata = () => {
            // Initialiser le canvas
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth
              canvasRef.current.height = videoRef.current.videoHeight
            }
            startScanning()
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

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current || codeReaderRef.current || !scanning) return

    // Créer le lecteur de codes
    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader

    // Fonction de scan avec canvas
    const scanFrame = async () => {
      if (!scanning || !videoRef.current || !canvasRef.current || isProcessing) {
        animationFrameRef.current = requestAnimationFrame(scanFrame)
        return
      }

      const now = Date.now()
      // Scanner environ 10 fois par seconde pour ne pas surcharger
      if (now - lastScanTimeRef.current < 100) {
        animationFrameRef.current = requestAnimationFrame(scanFrame)
        return
      }
      lastScanTimeRef.current = now

      try {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d', { willReadFrequently: true })

        // Vérifier que la vidéo est prête
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // Dessiner la frame actuelle sur le canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          setIsProcessing(true)
          
          try {
            // Créer une image depuis le canvas (méthode compatible)
            const image = new Image()
            image.src = canvas.toDataURL('image/png')
            
            // Attendre que l'image soit chargée
            await new Promise((resolve, reject) => {
              image.onload = resolve
              image.onerror = reject
              // Timeout de sécurité
              setTimeout(() => reject(new Error('Timeout')), 1000)
            })
            
            // Analyser l'image avec ZXing
            // Essayer d'abord sans hints pour la compatibilité
            let result = null
            try {
              result = await codeReader.decodeFromImageElement(image)
            } catch (e) {
              // Si ça échoue, essayer avec hints
              try {
                const hints = new Map()
                hints.set(DecodeHintType.TRY_HARDER, true)
                result = await codeReader.decodeFromImageElement(image, hints)
              } catch (e2) {
                throw e
              }
            }
            
            if (result) {
              const text = result.getText()
              console.log('Code détecté:', text)
              
              // Vérifier si c'est un identifiant à 7 chiffres
              const sevenDigitMatch = text.match(/^\d{7}$/)
              if (sevenDigitMatch) {
                setDetectedId(sevenDigitMatch[0])
                setScanning(false)
                stopScanning()
                return
              } else {
                // Essayer d'extraire 7 chiffres du texte
                const digits = text.replace(/\D/g, '')
                if (digits.length >= 7) {
                  const id = digits.substring(0, 7)
                  console.log('Identifiant extrait:', id)
                  setDetectedId(id)
                  setScanning(false)
                  stopScanning()
                  return
                }
              }
            }
          } catch (scanError) {
            // NotFoundException est normal, on continue à scanner
            if (scanError.name !== 'NotFoundException') {
              console.debug('Erreur scan:', scanError)
            }
          } finally {
            setIsProcessing(false)
          }
        }
      } catch (err) {
        console.error('Erreur lors du scan:', err)
        setIsProcessing(false)
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame)
    }

    // Démarrer la boucle de scan
    animationFrameRef.current = requestAnimationFrame(scanFrame)
  }

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (e) {
        console.debug('Erreur reset:', e)
      }
      codeReaderRef.current = null
    }
    setIsProcessing(false)
  }

  const handleRetry = () => {
    setDetectedId(null)
    setError(null)
    setScanning(true)
    stopScanning()
    // Attendre un peu avant de redémarrer
    setTimeout(() => {
      startScanning()
    }, 200)
  }

  const handleConfirm = () => {
    if (detectedId) {
      stopScanning()
      onScanComplete(detectedId)
    }
  }

  // Nettoyer à la fin
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

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
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }}
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
            {isProcessing && scanning && (
              <div className="scan-indicator">🔍 Analyse...</div>
            )}
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
            <p className="hint-text">Le code doit contenir un identifiant à 7 chiffres</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CameraCapture
