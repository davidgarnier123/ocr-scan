import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = async () => {
    setError(null);

    try {
      await Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            facingMode: "environment",
            aspectRatio: { min: 1, max: 2 }
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 2,
        decoder: {
          readers: ["code_128_reader"],
        },
        locate: true,
      }, (err) => {
        if (err) {
          console.error("Error starting Quagga:", err);
          setError("Camera error: " + (err.message || err));
          return;
        }
        Quagga.start();
        setIsScanning(true);
      });

      Quagga.onDetected((data) => {
        if (data && data.codeResult && data.codeResult.code) {
          const code = data.codeResult.code;
          // Robust validation for Code 128 (7 digits)
          if (code.length === 7 && /^\d+$/.test(code)) {
            // Optional: Check confidence if needed
            // if (data.codeResult.confidence > 0.7) ...
            console.log("Valid Scan:", code);
            onScan(code);
          }
        }
      });

    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Error: " + err.message);
    }
  };

  const stopScanning = () => {
    try {
      Quagga.stop();
      setIsScanning(false);
      // Quagga.offDetected(); // Clean up listeners if needed, but stop() usually handles it
    } catch (err) {
      console.error("Error stopping Quagga:", err);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="scanner-container">
      {error && <div className="error-message">{error}</div>}

      <div ref={scannerRef} className="scanner-video-container">
        {/* Quagga injects video and canvas here */}
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
