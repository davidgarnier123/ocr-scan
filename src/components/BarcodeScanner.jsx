import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from '@zxing/library';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [videoInputDevices, setVideoInputDevices] = useState([]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    
    // Configure hints to prioritize Code 128
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    console.log('Initializing scanner...');

    codeReader.listVideoInputDevices()
      .then((videoInputDevices) => {
        setVideoInputDevices(videoInputDevices);
        if (videoInputDevices.length > 0) {
          // Prefer back camera if available
          const backCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
          const deviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;
          setSelectedDeviceId(deviceId);
        } else {
          setError('No video input devices found');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Error listing video devices: ' + err.message);
      });

    return () => {
      codeReader.reset();
    };
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;

    const codeReader = new BrowserMultiFormatReader();
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);
    // hints.set(DecodeHintType.TRY_HARDER, true); // Can be resource intensive, enable if needed

    console.log(`Starting scan on device: ${selectedDeviceId}`);

    codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
      if (result) {
        const text = result.getText();
        // Validation: 7 digits
        if (text.length === 7 && /^\d+$/.test(text)) {
          console.log('Valid scan:', text);
          onScan(text);
        } else {
            console.log('Ignored scan (invalid format):', text);
        }
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
      }
    });

    return () => {
      console.log('Stopping scan...');
      codeReader.reset();
    };
  }, [selectedDeviceId, onScan]);

  return (
    <div className="scanner-container">
      {error && <div className="error-message">{error}</div>}
      <div className="video-wrapper">
        <video ref={videoRef} className="scanner-video" />
        <div className="scanner-overlay">
          <div className="scanner-line"></div>
        </div>
      </div>
      <div className="controls">
        <select 
            onChange={(e) => setSelectedDeviceId(e.target.value)} 
            value={selectedDeviceId || ''}
            className="device-select"
        >
            {videoInputDevices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default BarcodeScanner;
