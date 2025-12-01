import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

const qrcodeRegionId = "html5qr-code-reader";

const Html5QrcodePlugin = (props) => {
    const html5QrcodeRef = useRef(null);

    useEffect(() => {
        const config = {
            fps: props.fps || 10,
            qrbox: props.qrbox || 250,
            aspectRatio: props.aspectRatio || 1.0,
            formatsToSupport: props.formatsToSupport,
        };

        const verbose = props.verbose === true;

        if (!props.qrCodeSuccessCallback) {
            throw new Error("qrCodeSuccessCallback is required");
        }

        // Utiliser Html5Qrcode au lieu de Html5QrcodeScanner pour plus de contrôle
        const html5Qrcode = new Html5Qrcode(qrcodeRegionId, { verbose });

        const startScanning = async () => {
            try {
                const cameras = await Html5Qrcode.getCameras();
                if (cameras && cameras.length > 0) {
                    // Chercher la caméra arrière
                    const backCamera = cameras.find(camera =>
                        camera.label.toLowerCase().includes('back') ||
                        camera.label.toLowerCase().includes('arrière') ||
                        camera.label.toLowerCase().includes('rear')
                    ) || cameras[cameras.length - 1]; // Fallback: dernière caméra

                    // Démarrer le scan avec la caméra sélectionnée
                    await html5Qrcode.start(
                        backCamera.id,
                        {
                            fps: config.fps,
                            qrbox: config.qrbox,
                            aspectRatio: config.aspectRatio,
                        },
                        (decodedText, decodedResult) => {
                            // Ne pas arrêter le scan, juste appeler le callback
                            props.qrCodeSuccessCallback(decodedText, decodedResult);
                        },
                        (errorMessage) => {
                            // Ignorer les erreurs de scan normales
                            if (props.qrCodeErrorCallback && !errorMessage.includes('NotFoundException')) {
                                props.qrCodeErrorCallback(errorMessage);
                            }
                        }
                    );

                    html5QrcodeRef.current = html5Qrcode;
                }
            } catch (err) {
                console.error("Erreur démarrage scanner:", err);
            }
        };

        startScanning();

        // Cleanup
        return () => {
            if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
                html5QrcodeRef.current.stop().catch(console.error);
            }
        };
    }, [props.fps, props.qrbox, props.aspectRatio, props.formatsToSupport]);

    return (
        <div>
            <div id={qrcodeRegionId} />
        </div>
    );
};

export default Html5QrcodePlugin;
