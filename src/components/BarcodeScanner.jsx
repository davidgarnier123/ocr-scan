import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Create instance
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 }, // Rectangular box for barcodes
      aspectRatio: 1.0,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };

    const startScanning = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, // Prefer back camera
          config,
          (decodedText, decodedResult) => {
            // Success callback
            if (decodedText) {
              // Robust validation for Code 128 (7 digits)
              if (decodedText.length === 7 && /^\d+$/.test(decodedText)) {
                console.log("Valid Scan:", decodedText);
                onScan(decodedText);
              } else {
                console.log("Ignored Scan (invalid format):", decodedText);
              }
            }
          },
          (errorMessage) => {
            // Error callback (scanning in progress, usually ignored)
            // console.log(errorMessage);
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error("Error starting scanner:", err);
        setError("Camera error: " + (err.message || err));
      }
    };

    startScanning();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [onScan]);

  return (
    <div className="scanner-container">
      {error && <div className="error-message">{error}</div>}
      <div id="reader" className="scanner-video-container"></div>
      <div className="scanner-overlay-ui">
        <div className="scan-region-marker"></div>
        <p className="scanner-instruction">Scan 7-digit Code 128</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
