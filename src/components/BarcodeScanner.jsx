import React, { useEffect, useRef, useState } from 'react';
import * as zbarWasm from '@undecaf/zbar-wasm';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan, settings }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const nativeDetectorRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  const fileInputRef = useRef(null);

  // Re-initialize scanner when settings change (if scanning)
  useEffect(() => {
    if (isScanning) {
      stopScanning();
      startScanning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.useNative, settings.resolution, settings.formats]);

  const startScanning = async () => {
    setError(null);
    try {
      // Check for Native BarcodeDetector if enabled
      if (settings.useNative && 'BarcodeDetector' in window) {
        try {
          const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
          const formatsToUse = settings.formats.filter(f => supportedFormats.includes(f));

          if (formatsToUse.length > 0) {
            nativeDetectorRef.current = new window.BarcodeDetector({
              formats: formatsToUse
            });
            console.log("Using Native BarcodeDetector with formats:", formatsToUse);
          } else {
            console.warn("No requested formats supported by Native Detector");
            // Fallback or just warn? For now, we stick to user preference but maybe show error.
          }
        } catch (e) {
          console.warn("Native BarcodeDetector failed init", e);
        }
      }

      const resolutionMap = {
        '480': { width: 640, height: 480 },
        '720': { width: 1280, height: 720 },
        '1080': { width: 1920, height: 1080 },
        '2160': { width: 3840, height: 2160 }
      };

      const constraints = resolutionMap[settings.resolution] || resolutionMap['1080'];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: constraints.width },
          height: { ideal: constraints.height }
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

      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

      if (settings.useNative && nativeDetectorRef.current) {
        // --- NATIVE DETECTION ---
        try {
          const barcodes = await nativeDetectorRef.current.detect(source);
          if (barcodes.length > 0) {
            const barcode = barcodes[0];
            detectedCode = barcode.rawValue;

            // Draw box
            if (settings.showBoundingBox && barcode.boundingBox) {
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
          console.warn("Native detection error:", err);
        }
      } else {
        // --- ZBAR WASM DETECTION ---
        // Ensure we have image data from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const results = await zbarWasm.scanImageData(imageData);

        if (results.length > 0) {
          // Filter results based on settings if possible, or just take the first valid one
          // ZBar returns 'type' which is the symbology (e.g. 'CODE-128')
          // We might need to map settings.formats to ZBar types if we want strict filtering
          // For now, we accept all and let the user verify

          const result = results[0];
          detectedCode = result.decode ? result.decode() : result.data;

          // Draw box
          if (settings.showBoundingBox && result.points && result.points.length > 0) {
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

    const now = Date.now();
    if (now - lastScanTimeRef.current >= settings.scanInterval) {
      lastScanTimeRef.current = now;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Detect
        await detectFromSource(video, canvas, ctx);
      }
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
            {settings.useNative ? "⚡ Native Scanner" : "📷 ZBar Scanner"}
          </p>
          <p className="scanner-sub-instruction">
            {settings.formats.join(', ').replace(/_/g, ' ').toUpperCase()}
          </p>

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
          <button className="btn-stop" onClick={stopScanning}>
            ⏹ Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
