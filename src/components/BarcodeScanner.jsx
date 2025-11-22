import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Create instance with verbose=false
    // Restrict formats in constructor
    const html5QrCode = new Html5Qrcode("reader", {
      formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128],
      verbose: false
    });
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
      fps: 15, // Increased FPS for better detection
      qrbox: { width: 300, height: 100 }, // Wider box for Code 128
      aspectRatio: 1.0,
      videoConstraints: {
        facingMode: "environment",
        focusMode: "continuous" // Important for close-up scanning
      }
    };

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          if (decodedText) {
            // Robust validation for Code 128 (7 digits)
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
