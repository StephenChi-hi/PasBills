# PWA Setup Documentation

This app has been converted to a Progressive Web App (PWA) with splash screen support.

## Features Implemented

### 1. **Service Worker** (`public/sw.js`)
- Offlineфункциональность
- Network-first strategy for API calls
- Cache-first strategy for static assets
- Automatic cache cleanup

### 2. **Web Manifest** (`public/manifest.json`)
- App metadata (name, description, icons)
- Display mode set to "standalone" (full app experience)
- Theme colors for Android and iOS
- Screenshot support for app stores
- Maskable icons for adaptive displays

### 3. **PWA Meta Tags** (`app/layout.tsx`)
- Apple Web App capability
- Theme color configuration
- Status bar styling
- Apple touch icon
- Viewport settings for PWA

### 4. **Splash Screen** (`app/splash-screen.tsx`)
- Smooth loading experience
- Animated splash screen with app branding
- Auto-dismisses after 500ms

### 5. **PWA Client** (`app/pwa-client.tsx`)
- Service worker registration
- Install prompt handling
- Theme color detection (light/dark mode)

## Installation

### Desktop (Chrome, Edge, Firefox)
1. Open the app in your browser
2. Click the install button in the address bar (if available)
3. Follow the prompts to install

### Mobile (iOS)
1. Open in Safari
2. Tap Share → Add to Home Screen
3. Tap Add

### Mobile (Android)
1. Open in Chrome
2. Tap the menu (3 dots) → "Install app"
3. Confirm installation

## Optional Enhancements

### Install Button Component
If you want to add a custom install button to your UI:

```tsx
'use client';

import { useState, useEffect } from 'react';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstall}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Install App
    </button>
  );
}
```

## Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application → Manifest
3. Verify manifest.json is loaded
4. Go to Service Workers
5. Verify service worker is registered and running

### Lighthouse PWA Audit
1. Open DevTools
2. Go to Lighthouse
3. Run PWA audit
4. Check for any issues

## Building for Production

Before building:
1. Ensure all icon files exist in `public/images/`
2. Verify manifest.json is correctly configured
3. Test service worker caching strategy

Build command:
```bash
npm run build
```

## Notes

- The app will work offline but with limited functionality (API calls won't work)
- Service worker caches only static assets and successful responses
- API calls always go through the network first
- Supabse calls are excluded from service worker caching
- The splash screen appears for 500ms on app load

## Icon Replacement

The current icons are SVG placeholders. For production:
1. Generate proper 192x192 and 512x512 PNG icons
2. Create maskable versions for adaptive displays
3. Replace files in `public/images/`
4. Ensure icons have transparent backgrounds for maskable versions
