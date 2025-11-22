import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Create instance
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      aspectRatio: 1.0,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          if (decodedText) {
            if (decodedText.length === 7 && /^\d+$/.test(decodedText)) {
              console.log("Valid Scan:", decodedText);
              onScan(decodedText);
            }
          }
        },
        (errorMessage) => {
          // ignore
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError("Camera error: " + (err.message || err));
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  return (
    <div className="scanner-container">
      {error && <div className="error-message">{error}</div>}

      <div id="reader" className="scanner-video-container"></div>

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
