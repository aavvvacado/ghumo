# Ghumo AI Agent & Pair Programming Guidelines

Welcome to the **Ghumo** repository. This file provides critical context and operational guidelines for all AI agents and developers working on this project.

---

## 1. Expo SDK 57 Critical Constraints

- **SDK Version**: Expo 57.0.0. Read the versioned docs at `https://docs.expo.dev/versions/v57.0.0/`.
- **Install Commands**: NEVER use raw `npm install` for native libraries. ALWAYS use:
  ```bash
  npx expo install <package-name>
  ```
- **Deprecated Modules**: Do not import `SafeAreaView` from `react-native`. Always import `SafeAreaView` from `react-native-safe-area-context`.

---

## 2. Backend Startup & Connection Rules

- **Backend Location**: `ghumo_backend` repository.
- **Starting Command**:
  ```powershell
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```
  - **Rule**: `--host 0.0.0.0` is MANDATORY for physical devices on Wi-Fi (e.g. `10.16.237.241`) to connect to your backend.
  - **Rule**: Run `app.main:app`, not `main:app`.
- **Frontend Environment**: Set `EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:8000` in `.env`.
- For full setup and endpoint references, see [reference/backend_setup.md](file:///c:/Users/ashki/Downloads/ghumo/reference/backend_setup.md) and [reference/api_endpoints.md](file:///c:/Users/ashki/Downloads/ghumo/reference/api_endpoints.md).

---

## 3. Map System Architecture

- **Implementation**: [`src/components/home/MapBackground.tsx`](file:///c:/Users/ashki/Downloads/ghumo/src/components/home/MapBackground.tsx) uses Leaflet.js with official OpenStreetMap (OSM) raster tiles rendered inside `react-native-webview`.
- **Why**: Zero API keys required, zero watermarks, 100% free and reliable on Android and iOS (native Google Maps on Android in Expo Go blocks tile rendering without a registered Google Cloud key).
- **Dark Mode**: Configured via CSS color inversion filter on OSM tiles (`invert(100%) hue-rotate(180deg) brightness(85%) contrast(92%)`).
- **Pins**:
  - `userLocation`: Glowing pulsing dot (`📍 You Are Here`) from `expo-location`.
  - `searchResults`: Pins with place titles, categories, and ratings from `PlaceSearchResult`.
- **Unobstructed Layout**: Keep the map background 100% visible and interactive. Do not place opaque static containers or center logos over the map on launch.

---

## 4. API Calling Discipline (Prevent Rate Limiting & Aggressive Calls)

- **Strict Rule**: Do NOT debounce searches while user is typing in the search bar. Searches must only fire on explicit user submit (tapping Search or pressing Enter).
- Do not auto-fetch suggestions or place data repeatedly in mount `useEffect` hooks.

---

## 5. Verification Before Ending Turn

- Always run `npx tsc --noEmit` and confirm **0 errors** before completing any task.
- Use `logger.ts` (`logger.app`, `logger.api`, `logger.search`, `logger.error`) for clean, categorized diagnostics.
