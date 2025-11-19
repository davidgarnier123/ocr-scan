# Code Scanner - Gestion d'écrans

Application web React.js pour scanner et gérer des écrans avec des codes-barres contenant des identifiants à 7 chiffres. Fonctionne entièrement en local sur le téléphone, sans connexion internet nécessaire après le premier chargement.

## ✨ Fonctionnalités

- 📷 **Scan en temps réel** avec la caméra du smartphone (caméra arrière par défaut)
- 🔍 **Détection de codes-barres** en direct avec ZXing.js pour lire les identifiants à 7 chiffres
- ➕ **Ajout d'écrans** scannés avec date d'ajout
- 🗑️ **Suppression d'écrans** de la liste
- 💾 **Stockage local** (localStorage) - toutes les données restent sur votre appareil
- 📱 **Installation PWA** - peut être installée comme une application native
- 🌐 **Fonctionne hors ligne** après le premier chargement

## 🚀 Installation

### Prérequis
- Node.js 18+ et npm

### Étapes

1. **Installer les dépendances :**
```bash
npm install
```

2. **Lancer en mode développement :**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000` (ou l'IP de votre machine pour tester sur mobile)

3. **Build pour production :**
```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`

## 📱 Utilisation

### Sur smartphone (recommandé)

1. **Premier lancement :**
   - Ouvrez l'application dans votre navigateur mobile (Chrome, Safari, etc.)
   - Autorisez l'accès à la caméra quand demandé

2. **Scanner un code-barres :**
   - Cliquez sur "📷 Scanner un code-barres"
   - Pointez la caméra vers le code-barres contenant l'identifiant à 7 chiffres
   - La détection se fait automatiquement en temps réel
   - L'identifiant détecté s'affichera automatiquement
   - Cliquez sur "✓ Confirmer" pour ajouter l'écran

3. **Gérer les écrans :**
   - Tous les écrans scannés apparaissent dans la liste
   - Cliquez sur 🗑️ pour supprimer un écran
   - Les données sont sauvegardées automatiquement en local

## 🔧 Installation PWA

Pour installer l'application comme une PWA sur votre smartphone :

### Android (Chrome)
1. Ouvrez l'application dans Chrome
2. Appuyez sur le menu (⋮) en haut à droite
3. Sélectionnez "Ajouter à l'écran d'accueil" ou "Installer l'application"
4. Confirmez l'installation

### iOS (Safari)
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton de partage (□↑)
3. Sélectionnez "Sur l'écran d'accueil"
4. Confirmez l'ajout

Une fois installée, l'application fonctionnera comme une app native et pourra être utilisée hors ligne.

## 🎯 Notes importantes

- **Permissions :** L'application nécessite l'accès à la caméra pour fonctionner.
- **Stockage :** Toutes les données (écrans scannés) sont stockées localement sur votre appareil. Elles ne sont jamais envoyées sur internet.
- **Détection en temps réel :** Le scan se fait automatiquement dès que le code-barres est visible dans le cadre de scan.
- **Format des codes :** L'application détecte les codes-barres (EAN, Code 128, QR Code, etc.) et extrait les identifiants à 7 chiffres.

## 🛠️ Technologies

- **React 18** - Framework UI
- **Vite** - Build tool et serveur de développement
- **ZXing.js** (@zxing/library) - Détection de codes-barres en temps réel (fonctionne entièrement en local)
- **Vite PWA Plugin** - Configuration PWA et service worker
- **localStorage** - Stockage local des données

## 📝 Structure du projet

```
ocr-scan/
├── src/
│   ├── components/
│   │   ├── CameraCapture.jsx    # Composant de capture et OCR
│   │   └── ScreenList.jsx        # Liste des écrans
│   ├── App.jsx                   # Composant principal
│   ├── main.jsx                  # Point d'entrée
│   └── index.css                 # Styles globaux
├── public/                       # Fichiers statiques
├── vite.config.js                # Configuration Vite et PWA
└── package.json
```

## 🔍 Dépannage

**La caméra ne s'ouvre pas :**
- Vérifiez que vous avez autorisé l'accès à la caméra dans les paramètres du navigateur
- Assurez-vous d'utiliser HTTPS (ou localhost) - la caméra ne fonctionne pas en HTTP

**Le code-barres n'est pas détecté :**
- Assurez-vous que le code-barres est bien visible et éclairé
- Maintenez la caméra stable et pointez-la directement vers le code
- Le code doit être dans le cadre de scan affiché à l'écran
- Vérifiez que le code-barres n'est pas endommagé ou illisible

**L'application ne s'installe pas en PWA :**
- Vérifiez que vous utilisez un navigateur compatible (Chrome, Edge, Safari)
- Assurez-vous que le service worker est activé (vérifiez dans les DevTools)

