import React from 'react';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import './BarcodeScanner.css';
import { Html5QrcodeSupportedFormats } from "html5-qrcode";

const BarcodeScanner = ({ onScan, settings }) => {

  const onNewScanResult = (decodedText, decodedResult) => {
    console.log("Scan détecté:", decodedText, decodedResult);

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
      <Html5QrcodePlugin
        fps={settings.fps || 10}
        qrbox={settings.qrbox || 250}
        aspectRatio={settings.aspectRatio || 1.0}
        disableFlip={false}
        formatsToSupport={[Html5QrcodeSupportedFormats.CODE_128]}
        qrCodeSuccessCallback={onNewScanResult}
        qrCodeErrorCallback={onScanError}
        verbose={false}
      />
    </div>
  );
};

export default BarcodeScanner;
