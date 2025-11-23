import React, { useEffect, useRef, useState } from 'react';
import * as zbarWasm from '@undecaf/zbar-wasm';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const nativeDetectorRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  const [usingNative, setUsingNative] = useState(false);

  const fileInputRef = useRef(null);

  const startScanning = async () => {
    setError(null);
    try {
      // Check for Native BarcodeDetector
      if ('BarcodeDetector' in window && !nativeDetectorRef.current) {
        try {
          const formats = await window.BarcodeDetector.getSupportedFormats();
          if (formats.includes('code_128') || formats.includes('code_39')) {
            nativeDetectorRef.current = new window.BarcodeDetector({
              formats: ['code_128', 'code_39']
            });
            setUsingNative(true);
            console.log("Using Native BarcodeDetector");
          }
        } catch (e) {
          console.warn("Native BarcodeDetector failed, falling back to ZBar", e);
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 }, // Higher res for better zoom
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsScanning(true);
          scanFrame();
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera error: " + (err.message || err));
    }
  };

  const detectFromSource = async (source, canvas, ctx) => {
    try {
      let detectedCode = null;

      if (usingNative && nativeDetectorRef.current) {
        // --- NATIVE DETECTION ---
        try {
          const barcodes = await nativeDetectorRef.current.detect(source);
          if (barcodes.length > 0) {
            const barcode = barcodes[0];
            detectedCode = barcode.rawValue;

            // Draw box
            if (barcode.boundingBox) {
              ctx.beginPath();
              ctx.lineWidth = 4;
              ctx.strokeStyle = "#00FF00";
              ctx.rect(
                barcode.boundingBox.x,
                barcode.boundingBox.y,
                barcode.boundingBox.width,
                barcode.boundingBox.height
              );
              ctx.stroke();
            }
          }
        } catch (err) {
          // Native failed
          console.warn("Native detection error:", err);
        }
      } else {
        // --- ZBAR WASM DETECTION ---
        // Ensure we have image data from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const results = await zbarWasm.scanImageData(imageData);
        if (results.length > 0) {
          const result = results[0];
          detectedCode = result.decode ? result.decode() : result.data;

          // Draw box
          if (result.points && result.points.length > 0) {
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#00FF00";
            const points = result.points;
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
      }

      if (detectedCode) {
        console.log("Detected:", detectedCode);
        setLastScanned(detectedCode);
        if (detectedCode.length >= 3) {
          onScan(detectedCode);
        }
        return true;
      }
    } catch (scanErr) {
      console.error("Scan error:", scanErr);
    }
    return false;
  };

  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect
      await detectFromSource(video, canvas, ctx);
    }

    // Schedule next scan
    if (isScanning) {
      scanIntervalRef.current = requestAnimationFrame(scanFrame);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Stop live scanning if active
    if (isScanning) {
      stopScanning();
    }

    setError(null);
    setLastScanned(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Resize canvas to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Detect
        const found = await detectFromSource(img, canvas, ctx);
        if (!found) {
          setError("No barcode detected in image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      cancelAnimationFrame(scanIntervalRef.current);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isScanning && !scanIntervalRef.current) {
      scanFrame();
    } else if (!isScanning && scanIntervalRef.current) {
      cancelAnimationFrame(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, [isScanning]);

  return (
    <div className="scanner-container">
      {error && <div className="error-message">{error}</div>}

      <div className="scanner-video-container">
        <video ref={videoRef} playsInline muted style={{ display: isScanning ? 'block' : 'none' }}></video>
        <canvas ref={canvasRef} className="drawing-canvas" style={{ display: isScanning ? 'absolute' : 'block' }}></canvas>
      </div>

      {isScanning && (
        <div className="scanner-overlay-ui">
          <div className="scan-region-marker"></div>
          <p className="scanner-instruction">
            {usingNative ? "⚡ Native Scanner" : "📷 Web Scanner"}
          </p>
          <p className="scanner-sub-instruction">Scan Code 128 or Code 39</p>

          {lastScanned && <p className="last-scanned">Last: {lastScanned}</p>}
        </div>
      )}

      <div className="scanner-controls">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {!isScanning ? (
          <>
            <button className="btn-start" onClick={startScanning}>
              📷 Start Scanner
            </button>
            <button className="btn-photo" onClick={triggerFileInput}>
              🖼️ Take Photo
            </button>
          </>
        ) : (
          <>
            <button className="btn-stop" onClick={stopScanning}>
              ⏹ Stop
            </button>
            {/* Debug Toggle Button */}
            {'BarcodeDetector' in window && (
              <button
                className="btn-debug"
                onClick={() => setUsingNative(!usingNative)}
              >
                {usingNative ? "Switch to Web" : "Switch to Native"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
