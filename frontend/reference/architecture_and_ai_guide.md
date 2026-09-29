# Ghumo Architecture & AI Teammate Guide

A comprehensive architectural reference guide for human developers and future AI assistants collaborating on the **Ghumo** codebase.

---

## 1. Project Philosophy & Core Rules

1. **Expo SDK 57 Compatibility**:
   - Always verify native modules with `npx expo install <package>` to install SDK 57 aligned versions.
   - Use `react-native-safe-area-context` instead of deprecated `SafeAreaView` from `react-native`.

2. **Clean Architecture Separation**:
   - `src/domain/models/`: Pure TypeScript interfaces defining contracts (e.g. `PlaceSearchResult`, `AIPromptResponse`).
   - `src/data/api/`: Network transport layer (`apiClient.ts`) handling dynamic base URL resolution, timeout, and structured error reporting.
   - `src/data/services/`: Services implementing domain interfaces (`searchService.ts`, `aiService.ts`) with graceful fallbacks.
   - `src/context/`: React context providers for feature state (`homeContext.tsx`, `authContext.tsx`, `themeContext.tsx`, `errorContext.tsx`).
   - `src/components/`: Reusable presentation and interactive components.

3. **Performance & API Call Discipline**:
   - **NEVER debounce search on keystroke typing**: Typing in the search input must NOT trigger background API requests. Search is strictly invoked upon explicit user submit (pressing Enter or tapping Search button).
   - Do NOT run auto-fetching loops in `useEffect` on mount unless strictly necessary.

---

## 2. Map Layer Architecture

- **Component**: `src/components/home/MapBackground.tsx`
- **Engine**: Leaflet.js + Official OpenStreetMap (OSM) Tile Server via `react-native-webview`.
- **Why Leaflet + OSM was chosen over native Google Maps**:
  - Native Google Maps on Android requires a registered API key in `app.json`. Without it, Expo Go on Android renders a solid black box.
  - OpenStreetMap (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) is **100% free**, requires **zero API keys**, and has **no watermarks**.
- **Dark Mode Implementation**:
  - Implemented via CSS color filtering on `.dark-mode .leaflet-tile`:
    ```css
    filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(92%);
    ```
  - This turns standard OSM tiles into a sleek dark charcoal map that matches Ghumo's dark palette.
- **Markers**:
  - **User Geolocation**: Glowing orange/red pulsing dot (`📍 You Are Here`) retrieved via `expo-location`.
  - **Search Result Pins**: Pins plotted dynamically from `PlaceSearchResult` (`lat`, `lng`, `name`, `category`, `rating`).
  - **Camera Controls**: Automatically calls `map.fitBounds()` or `map.flyTo()` when pins or coordinates update.

---

## 3. Theme System & Visual Identity

- **Theme Context**: `src/context/themeContext.tsx`
- **Color Palettes**:
  - **Warm Ivory Mode** (Light): Warm cream/parchment backgrounds (`#FAF6F0`, `#F5EFE6`), terracotta accents (`#D95338`), warm charcoal text.
  - **Dark Charcoal Mode** (Dark): Deep warm dark backgrounds (`#1B1918`, `#242220`), bright terracotta highlights (`#D95338`), warm ivory text.
- **Glassmorphism**:
  - Floating pills, bottom bars, and cards use subtle translucent backgrounds (`rgba(255,255,255,0.08)` or `rgba(27,26,24,0.95)`) with rounded corners (`borderRadius: 20+`).

---

## 4. State Management Overview

| Context | File | Responsibilities |
| :--- | :--- | :--- |
| `HomeContext` | `src/context/homeContext.tsx` | Search queries, results, AI prompt/itinerary, user geolocation, place ratings, and manual search execution. |
| `AuthContext` | `src/context/authContext.tsx` | Supabase session, user profile, Google OAuth with deep linking, guest mode. |
| `ThemeContext` | `src/context/themeContext.tsx` | Light/dark theme toggle, design tokens, smooth cross-fade animations. |
| `ErrorContext` | `src/context/errorContext.tsx` | Global toast notification banners with auto-dismiss. |

---

## 5. Logging & Diagnostics

- **Logger**: `src/utils/logger.ts`
- Provides formatted console output:
  - `logger.auth(...)`: `[AUTH] ℹ️ ...`
  - `logger.api(...)`: `[API] ℹ️ ...`
  - `logger.search(...)`: `[SEARCH] ℹ️ ...`
  - `logger.app(...)`: `[APP] ℹ️ ...`
  - `logger.error(...)`: `[ERROR] ❌ ...`
  - `logger.warn(...)`: `[WARN] ⚠️ ...`

---

## 6. How Future AI Assistants Should Make Changes

1. **Verify TypeScript Types First**:
   Always run `npx tsc --noEmit` before concluding work to guarantee 0 compiler errors.
2. **Do Not Hardcode IPs**:
   Use `apiClient.getBaseUrl()` or `EXPO_PUBLIC_API_URL` which automatically detects host IP.
3. **Respect User Layout Decisions**:
   - The home screen background is an unobstructed full-screen map.
   - Do not re-add blocking center banners or large default cards covering the map on initial load.
