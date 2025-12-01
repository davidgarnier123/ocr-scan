import React, { useState } from 'react';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import './BarcodeScanner.css';
import { Html5QrcodeSupportedFormats } from "html5-qrcode";

const BarcodeScanner = ({ onScan, settings }) => {
  const [isScanning, setIsScanning] = useState(false);

  const onNewScanResult = (decodedText, decodedResult) => {
    console.log("Scan détecté:", decodedText, decodedResult);

    // Valider que c'est un code à 7 chiffres
    if (!/^\d{7}$/.test(decodedText)) {
      console.log("Code ignoré (pas 7 chiffres):", decodedText);
      return; // Ignorer les codes qui ne sont pas à 7 chiffres
    }

    // Vibrer si activé
    if (settings.vibrate && navigator.vibrate) {
      navigator.vibrate(200);
    }

    onScan(decodedText);
  };

  const onScanError = (errorMessage) => {
    // Ignorer les erreurs "NotFoundException" qui sont normales
    if (!errorMessage.includes('NotFoundException')) {
      console.warn('Erreur scan:', errorMessage);
    }
  };

  return (
    <div className="scanner-container">
      {isScanning ? (
        <Html5QrcodePlugin
          fps={settings.fps || 10}
          qrbox={settings.qrbox || 250}
          aspectRatio={settings.aspectRatio || 1.0}
          cameraId={settings.cameraId}
          formatsToSupport={[Html5QrcodeSupportedFormats.CODE_128]}
          qrCodeSuccessCallback={onNewScanResult}
          qrCodeErrorCallback={onScanError}
          verbose={false}
        />
      ) : (
        <div className="scanner-placeholder">
          <div className="placeholder-content">
            <span className="placeholder-icon">📷</span>
            <p>Scanner désactivé</p>
          </div>
        </div>
      )}

      <div className="scanner-controls">
        <button
          className={`scanner-toggle-btn ${isScanning ? 'scanning' : ''}`}
          onClick={() => setIsScanning(!isScanning)}
        >
          {isScanning ? '⏸ Arrêter le scan' : '▶ Démarrer le scan'}
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner;
