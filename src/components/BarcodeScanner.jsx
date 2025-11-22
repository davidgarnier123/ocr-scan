import React, { useEffect, useRef, useState } from 'react';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const streamRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    // Check support
    if (!('BarcodeDetector' in window)) {
      setError("BarcodeDetector API is not supported in this browser. Please use Chrome.");
    }

    return () => {
      stopScanning();
    };
  }, []);

  const detectBarcode = async (detector) => {
    if (!videoRef.current || !isScanning) return;

    try {
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        if (code && code.length === 7 && /^\d+$/.test(code)) {
          console.log("Valid Scan:", code);
          onScan(code);
          // Optional: throttle or visual feedback could be added here
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    if (isScanning) {
      requestRef.current = requestAnimationFrame(() => detectBarcode(detector));
    }
  };

  const startScanning = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          focusMode: "continuous",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setIsScanning(true);

        const detector = new window.BarcodeDetector({
          formats: ['code_128']
        });

        requestRef.current = requestAnimationFrame(() => detectBarcode(detector));
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      setError("Camera error: " + (err.message || err));
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="scanner-container">
      {error && <div className="error-message">{error}</div>}

      <div className="scanner-video-container">
        <video ref={videoRef} className="scanner-video" playsInline muted autoPlay></video>
      </div>

      {isScanning && (
        <div className="scanner-overlay-ui">
          <div className="scan-region-marker"></div>
          <p className="scanner-instruction">Scan 7-digit Code 128</p>
        </div>
      )}

      <div className="scanner-controls">
        {!isScanning ? (
          <button className="btn-start" onClick={startScanning}>
            📷 Start Scanner
          </button>
        ) : (
          <button className="btn-stop" onClick={stopScanning}>
            ⏹ Stop Scanner
          </button>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
