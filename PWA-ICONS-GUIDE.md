# Generate PWA Icons

To complete the PWA configuration, you need to create the icons in the `public/` folder.

## Required Icons

1. **pwa-192x192.png** (192x192 pixels)
2. **pwa-512x512.png** (512x512 pixels)
3. **apple-touch-icon.png** (180x180 pixels)
4. **favicon.ico** (32x32 pixels)

## How to Generate (Use one of these options)

### Option 1: Use the Included Logo + PWA Asset Generator (FASTEST)

```bash
npx @vite-pwa/assets-generator --preset minimal public/logo.svg
```

This command will automatically generate all required icons from `logo.svg`!

### Option 2: Online Generator

Use **RealFaviconGenerator**:
1. Access: https://realfavicongenerator.net/
2. Upload `public/logo.svg` (or your own logo)
3. Download the complete package
4. Place the files in the `public/` folder


### Option 3: PWA Builder Online Tool

1. Access: https://www.pwabuilder.com/imageGenerator
2. Upload `public/logo.svg`
3. Download the generated icons
4. Place them in the `public/` folder

## Final Structure

```
public/
├── pwa-192x192.png
├── pwa-512x512.png
├── apple-touch-icon.png
└── favicon.ico
```

## Testing the PWA

After generating the icons and deploying:

- **Desktop (Chrome/Edge)**: The installation icon appears in the address bar
- **Android**: The installation banner appears automatically
- **iOS**: Use "Add to Home Screen" in Safari

## Verifying the PWA

Use Lighthouse in Chrome DevTools:
1. Open DevTools (F12)
2. Go to the "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Analyze page load"