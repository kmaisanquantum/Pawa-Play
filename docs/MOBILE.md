# Mobile App Wrapper with Capacitor (iOS & Android)

This repository contains a unified React web application in `frontend/` designed to be wrapped into native iOS and Android mobile apps using [Capacitor](https://capacitorjs.com/).

---

## 1. Overview

The web app in `frontend/` serves both as the web UI when served directly by NestJS and as the mobile UI when built into Capacitor native shells.

When running as a mobile phone app:
- The web assets (`frontend/dist/`) are embedded inside the mobile app bundle.
- API calls must point to the remote deployed backend instead of relative path `/api/v1`.

---

## 2. Prerequisites

- **Node.js:** 20+
- **Xcode & CocoaPods:** For iOS builds (macOS only)
- **Android Studio & JDK:** For Android builds

---

## 3. Initializing Capacitor in `frontend/`

To wrap the web app into mobile platforms, run the following commands inside `frontend/`:

```bash
cd frontend

# 1. Install Capacitor core dependencies
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/ios @capacitor/android

# 2. Initialize Capacitor
npx cap init PawaPlay com.pawaplay.app --web-dir dist
```

---

## 4. Building Mobile Apps for Production

### Step A: Configure API Base URL
When building for iOS/Android, set `VITE_API_BASE_URL` to your production Coolify backend endpoint in `frontend/.env.production` or environment variables:

```bash
VITE_API_BASE_URL=https://your-coolify-domain.com/api/v1
```

### Step B: Build Web Assets & Sync to Platforms

```bash
# Build web production bundle with remote API base URL
npm run build

# Add native platforms (run once)
npx cap add ios
npx cap add android

# Sync web assets to native iOS/Android projects
npx cap sync
```

### Step C: Open Native IDEs & Build Binaries

```bash
# Open Xcode for iOS build
npx cap open ios

# Open Android Studio for Android build
npx cap open android
```

From Xcode or Android Studio, you can build, simulate, or archive the native `.ipa` / `.apk` / `.aab` packages for distribution on Apple App Store and Google Play Store.
