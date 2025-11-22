import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

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
          halfSample: false, // Better for small barcodes
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
          readers: ["code_128_reader"],
          debug: {
            drawBoundingBox: true,
            showFrequency: true,
            drawScanline: true,
            showPattern: true
          },
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

      Quagga.onProcessed((result) => {
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
          if (result.boxes) {
            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
            result.boxes.filter((box) => box !== result.box).forEach((box) => {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
            });
          }

          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
          }

          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
          }
        }
      });

      Quagga.onDetected((data) => {
        if (data && data.codeResult && data.codeResult.code) {
          const code = data.codeResult.code;
          console.log("Raw Scan:", code, "Confidence:", data.codeResult.confidence);
          setLastScanned(code); // Show user what was seen

          // Robust validation for Code 128 (7 digits)
          if (code.length === 7 && /^\d+$/.test(code)) {
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
          {lastScanned && <p className="last-scanned">Last seen: {lastScanned}</p>}
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
