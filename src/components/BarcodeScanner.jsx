import React, { useEffect, useRef, useState } from 'react';
import * as zbarWasm from '@undecaf/zbar-wasm';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan, settings }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const nativeDetectorRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const hideToastTimerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const fileInputRef = useRef(null);

  // Re-initialize scanner when settings change (if scanning)
  useEffect(() => {
    if (isScanning) {
      stopScanning();
      startScanning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.detectionEngine, settings.resolution, settings.formats]);

  const startScanning = async () => {
    setError(null);
    setHasTorch(false);
    setTorchOn(false);

    // Stop any existing stream first
    stopScanning();

    try {
      // Initialize Detectors based on settings
      if (settings.detectionEngine === 'native' && 'BarcodeDetector' in window) {
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
          height: { ideal: constraints.height },
          aspectRatio: { ideal: 16 / 9 },
          // Optimisations pour la détection de codes-barres
          focusMode: { ideal: "continuous" },
          exposureMode: { ideal: "continuous" },
          whiteBalanceMode: { ideal: "continuous" },
          // Try to force continuous focus for better scanning
          advanced: [
            { focusMode: "continuous" },
            { focusMode: "macro" },
            { exposureMode: "continuous" },
            { whiteBalanceMode: "continuous" }
          ]
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            setIsScanning(true);
            scanFrame();

            // Check capabilities
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            const trackSettings = track.getSettings();

            console.log("Camera capabilities:", capabilities);
            console.log("Current settings:", trackSettings);

            // Build optimal constraints
            const optimalConstraints = { advanced: [] };

            // Focus
            if (capabilities.focusMode) {
              if (capabilities.focusMode.includes('continuous')) {
                optimalConstraints.advanced.push({ focusMode: 'continuous' });
              } else if (capabilities.focusMode.includes('manual')) {
                // Si continuous n'est pas disponible, essayer manual avec focusDistance
                if (capabilities.focusDistance) {
                  optimalConstraints.advanced.push({
                    focusMode: 'manual',
                    focusDistance: capabilities.focusDistance.max * 0.3 // Focus à ~30cm
                  });
                }
              }
            }

            // Exposure
            if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
              optimalConstraints.advanced.push({ exposureMode: 'continuous' });
            }

            // White Balance
            if (capabilities.whiteBalanceMode && capabilities.whiteBalanceMode.includes('continuous')) {
              optimalConstraints.advanced.push({ whiteBalanceMode: 'continuous' });
            }

            // Torch
            if (capabilities.torch) {
              setHasTorch(true);
            }

            // Apply optimal constraints
            if (optimalConstraints.advanced.length > 0) {
              try {
                await track.applyConstraints(optimalConstraints);
                console.log("Applied optimal constraints:", optimalConstraints);
              } catch (e) {
                console.warn("Failed to apply some constraints:", e);
              }
            }

          } catch (playErr) {
            console.error("Error playing video:", playErr);
            setError("Could not start video stream: " + playErr.message);
          }
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera error: " + (err.message || err));
    }
  };

  const toggleTorch = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const track = videoRef.current.srcObject.getVideoTracks()[0];
      try {
        await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
        setTorchOn(!torchOn);
      } catch (e) {
        console.error("Failed to toggle torch", e);
      }
    }
  };

  const detectFromSource = async (source, canvas, ctx) => {
    try {
      let detectedCode = null;

      // For non-native engines, limit processing size to improve performance
      let renderWidth = canvas.width;
      let renderHeight = canvas.height;

      if (settings.detectionEngine !== 'native') {
        const MAX_WIDTH = 1280;
        if (renderWidth > MAX_WIDTH) {
          const ratio = MAX_WIDTH / renderWidth;
          renderWidth = MAX_WIDTH;
          renderHeight = renderHeight * ratio;
        }
      }

      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image to canvas (scaled if needed)
      ctx.drawImage(source, 0, 0, renderWidth, renderHeight);

      if (settings.detectionEngine === 'native' && nativeDetectorRef.current) {
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
        // --- ZBAR WASM DETECTION (optimisé pour iOS) ---
        // ROI (Region of Interest) - scan center 60%
        const roiX = Math.floor(renderWidth * 0.2);
        const roiY = Math.floor(renderHeight * 0.2);
        const roiW = Math.floor(renderWidth * 0.6);
        const roiH = Math.floor(renderHeight * 0.6);

        // Draw ROI guide
        if (settings.showBoundingBox) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.strokeRect(roiX, roiY, roiW, roiH);
        }

        const imageData = ctx.getImageData(roiX, roiY, roiW, roiH);
        const results = await zbarWasm.scanImageData(imageData);

        if (results.length > 0) {
          const result = results[0];
          detectedCode = result.decode ? result.decode() : result.data;

          // Draw box (offset by ROI)
          if (settings.showBoundingBox && result.points && result.points.length > 0) {
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#00FF00";
            const points = result.points;
            ctx.moveTo(points[0].x + roiX, points[0].y + roiY);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x + roiX, points[i].y + roiY);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
      }

      if (detectedCode) {
        console.log("Detected:", detectedCode);

        // Clear any existing hide timer
        if (hideToastTimerRef.current) {
          clearTimeout(hideToastTimerRef.current);
        }

        setLastScanned(detectedCode);

        // Hide toast after 3 seconds
        hideToastTimerRef.current = setTimeout(() => {
          setLastScanned(null);
        }, 3000);

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
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        await detectFromSource(video, canvas, ctx);
      }
    }

    if (isScanning) {
      scanIntervalRef.current = requestAnimationFrame(scanFrame);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

        canvas.width = img.width;
        canvas.height = img.height;

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
    setHasTorch(false);
    setTorchOn(false);
    setLastScanned(null);

    if (scanIntervalRef.current) {
      cancelAnimationFrame(scanIntervalRef.current);
    }

    if (hideToastTimerRef.current) {
      clearTimeout(hideToastTimerRef.current);
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
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="scanner-video-container">
        <video ref={videoRef} playsInline muted style={{ display: isScanning ? 'block' : 'none' }}></video>
        <canvas ref={canvasRef} className="drawing-canvas" style={{ display: isScanning ? 'absolute' : 'block' }}></canvas>
      </div>

      {isScanning && (
        <div className="scanner-overlay-ui">
          <div className="scan-frame">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
            <div className="scan-line"></div>
          </div>

          <div className="scanner-info">
            <div className="info-badge">
              <span className="badge-icon">📱</span>
              <span className="badge-text">
                {settings.detectionEngine === 'native' ? 'Native Scanner' : 'ZBar Scanner'}
              </span>
            </div>
            {lastScanned && (
              <div className="last-scanned">
                <span className="scan-icon">✓</span>
                <span className="scan-text">{lastScanned}</span>
              </div>
            )}
          </div>

          {hasTorch && (
            <button
              className={`btn-torch ${torchOn ? 'active' : ''}`}
              onClick={toggleTorch}
              title="Toggle Flashlight"
            >
              <span className="torch-icon">{torchOn ? '🔦' : '💡'}</span>
              <span className="torch-text">{torchOn ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>
      )}

      <div className="scanner-controls">
        {!isScanning ? (
          <button className="btn-start" onClick={startScanning}>
            <span className="btn-icon">📷</span>
            <span className="btn-text">Démarrer le scan</span>
          </button>
        ) : (
          <button className="btn-stop" onClick={stopScanning}>
            <span className="btn-icon">⏹</span>
            <span className="btn-text">Arrêter</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
