import { useState, useRef, useEffect } from 'react'
import { createWorker } from 'tesseract.js'
import './CameraCapture.css'

function CameraCapture({ onScanComplete, onCancel }) {
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [detectedId, setDetectedId] = useState(null)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Démarrer la caméra
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
        }
      } catch (err) {
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
        console.error('Erreur caméra:', err)
      }
    }

    startCamera()

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      const imageData = canvas.toDataURL('image/png')
      setCapturedImage(imageData)
    }
  }

  const processOCR = async () => {
    if (!capturedImage) return

    setProcessing(true)
    setError(null)
    setDetectedId(null)

    try {
      const worker = await createWorker('fra', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`Progression: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      // Configuration pour améliorer la détection des chiffres
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: '6', // Uniform block of text
        tessedit_ocr_engine_mode: '1', // LSTM only
      })

      const { data: { text } } = await worker.recognize(capturedImage)
      await worker.terminate()

      // Extraire une séquence de 7 chiffres
      const sevenDigitMatch = text.match(/\d{7}/)
      
      if (sevenDigitMatch) {
        const id = sevenDigitMatch[0]
        setDetectedId(id)
      } else {
        // Essayer de trouver 7 chiffres consécutifs même avec des espaces
        const digits = text.replace(/\D/g, '')
        if (digits.length >= 7) {
          const id = digits.substring(0, 7)
          setDetectedId(id)
        } else {
          setError('Aucun identifiant à 7 chiffres détecté. Veuillez réessayer.')
        }
      }
    } catch (err) {
      setError('Erreur lors du traitement OCR: ' + err.message)
      console.error('Erreur OCR:', err)
    } finally {
      setProcessing(false)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setDetectedId(null)
    setError(null)
  }

  const handleConfirm = () => {
    if (detectedId) {
      onScanComplete(detectedId)
    }
  }


  return (
    <div className="camera-capture">
      <div className="camera-header">
        <button className="btn-cancel" onClick={onCancel}>
          ✕ Annuler
        </button>
        <h2>Scanner un écran</h2>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {!capturedImage ? (
        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="video-preview"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className="camera-controls">
            <button 
              className="btn-capture"
              onClick={capturePhoto}
              disabled={!stream}
            >
              📸 Prendre une photo
            </button>
          </div>
        </div>
      ) : (
        <div className="preview-view">
          <img 
            src={capturedImage} 
            alt="Capture" 
            className="preview-image"
          />
          
          {processing && (
            <div className="processing-overlay">
              <div className="spinner"></div>
              <p>Analyse en cours...</p>
            </div>
          )}

          {detectedId && !processing && (
            <div className="detected-id">
              <h3>Identifiant détecté:</h3>
              <div className="id-display">{detectedId}</div>
            </div>
          )}

          <div className="preview-controls">
            {!detectedId && !processing && (
              <>
                <button 
                  className="btn-secondary"
                  onClick={handleRetake}
                >
                  🔄 Reprendre
                </button>
                <button 
                  className="btn-primary"
                  onClick={processOCR}
                  disabled={processing}
                >
                  🔍 Analyser
                </button>
              </>
            )}
            
            {detectedId && !processing && (
              <>
                <button 
                  className="btn-secondary"
                  onClick={handleRetake}
                >
                  🔄 Reprendre
                </button>
                <button 
                  className="btn-success"
                  onClick={handleConfirm}
                >
                  ✓ Confirmer
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CameraCapture

