# Icônes PWA

Pour que l'application fonctionne comme une PWA, vous devez créer deux icônes PNG :

- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)

Vous pouvez créer ces icônes à partir d'une image en utilisant un outil en ligne comme :
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

Ou utilisez un outil de ligne de commande comme ImageMagick :

```bash
# Si vous avez une image source (icon.png)
convert icon.png -resize 192x192 pwa-192x192.png
convert icon.png -resize 512x512 pwa-512x512.png
```

Pour l'instant, l'application fonctionnera sans ces icônes, mais elles sont recommandées pour une meilleure expérience PWA.

