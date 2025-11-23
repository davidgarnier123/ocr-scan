import React, { useEffect, useRef, useState } from 'react';
import zbarWasm from '@undecaf/zbar-wasm';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const scanIntervalRef = useRef(null);

  const startScanning = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
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

  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const results = await zbarWasm.scanImageData(imageData);
        if (results.length > 0) {
          const result = results[0];
          // ZBar returns data as Uint8Array or similar, need to decode if it's not a string
          // @undecaf/zbar-wasm usually returns objects with decode() method or 'data' property
          const code = result.decode ? result.decode() : result.data;
          const type = result.typeName;

          console.log("Detected:", code, "Type:", type);
          setLastScanned(code);

          // Draw bounding box
          if (result.points && result.points.length > 0) {
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "green";
            const points = result.points;
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.stroke();
          }

          if (code && code.length >= 3) {
            onScan(code);
          }
        }
      } catch (scanErr) {
        console.error("Scan error:", scanErr);
      }
    }

    // Schedule next scan
    if (isScanning) {
      scanIntervalRef.current = requestAnimationFrame(scanFrame);
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
    // Start scanning loop when isScanning becomes true is handled in startScanning
    // But we need to ensure we stop when component unmounts
    return () => {
      stopScanning();
    };
  }, []);

  // Re-trigger scan loop if isScanning is true (e.g. after a pause, though we handle it in startScanning)
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
        <video ref={videoRef} playsInline muted></video>
        <canvas ref={canvasRef} className="drawing-canvas"></canvas>
      </div>

      {isScanning && (
        <div className="scanner-overlay-ui">
          <div className="scan-region-marker"></div>
          <p className="scanner-instruction">Scan Code 128 or Code 39</p>
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
