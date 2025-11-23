import React, { useEffect, useRef, useState } from 'react';
import zbarWasm from '@undecaf/zbar-wasm';
import './BarcodeScanner.css';

            📷 Start Scanner
          </button >
        ) : (
  <button className="btn-stop" onClick={stopScanning}>
    ⏹ Stop Scanner
  </button>
)}
      </div >
    </div >
  );
};

export default BarcodeScanner;
