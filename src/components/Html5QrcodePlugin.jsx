import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

const qrcodeRegionId = "html5qr-code-reader";

const Html5QrcodePlugin = (props) => {
    useEffect(() => {
        // Configuration du scanner
        const config = {
            fps: props.fps || 10,
            qrbox: props.qrbox || 250,
            aspectRatio: props.aspectRatio || 1.0,
            disableFlip: props.disableFlip !== undefined ? props.disableFlip : false,
            formatsToSupport: props.formatsToSupport,
            // Utiliser des contraintes plus permissives pour éviter NotAllowedError
            videoConstraints: {
                facingMode: { ideal: "environment" }, // ideal au lieu de exact
                aspectRatio: props.aspectRatio || 1.0
            },
            // Ajouter support pour les résolutions
            ...(props.videoConstraints && { videoConstraints: props.videoConstraints })
        };

        const verbose = props.verbose === true;

        // Le callback de succès est requis
        if (!props.qrCodeSuccessCallback) {
            throw new Error("qrCodeSuccessCallback is required");
        }

        // Créer et initialiser le scanner
        const html5QrcodeScanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            config,
            verbose
        );

        html5QrcodeScanner.render(
            props.qrCodeSuccessCallback,
            props.qrCodeErrorCallback
        );

        // Cleanup au démontage
        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner.", error);
            });
        };
    }, [props.fps, props.qrbox, props.aspectRatio, props.formatsToSupport]);

    return <div id={qrcodeRegionId} />;
};

export default Html5QrcodePlugin;
