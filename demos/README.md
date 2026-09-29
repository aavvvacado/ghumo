# 🧭 Ghumo — App Showcase & Feature Demos

> **Ghumo** (घूमो • *to wander / explore*) is a modern, AI-powered travel companion and hyper-local discovery platform built with Expo (React Native), Supabase, FastAPI, and OpenStreetMap. Designed with a warm terracotta visual identity, glassmorphism aesthetics, and intelligent multi-modal trip planning.

---

## 📸 Visual Showcase & Gallery

<div align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <img src="./samples/screen-20260912-042441_exported_0.jpg" alt="Authentication & Onboarding" width="100%" />
        <br />
        <sub><b>🔐 Smart Authentication</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="./samples/screen-20260912-042441_exported_7413.jpg" alt="Live Map & Geolocation" width="100%" />
        <br />
        <sub><b>📍 Live Map & Geolocation</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="./samples/screen-20260912-042441_exported_10450.jpg" alt="Instant Search" width="100%" />
        <br />
        <sub><b>🔍 Instant Search Flow</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="./samples/screen-20260912-042441_exported_13304.jpg" alt="Search & Explore Sheet" width="100%" />
        <br />
        <sub><b>✨ Explore & Inspirations</b></sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="25%">
        <img src="./samples/screen-20260912-042441_exported_19169.jpg" alt="Interactive Map POIs" width="100%" />
        <br />
        <sub><b>🗺️ Interactive Map POIs</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="./samples/screen-20260912-042441_exported_37593.jpg" alt="AI Travel Planner Hub" width="100%" />
        <br />
        <sub><b>🤖 AI Planner Hub</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="./samples/screen-20260912-042441_exported_61401.jpg" alt="YouTube Vlog Itinerary" width="100%" />
        <br />
        <sub><b>🎥 YouTube Video AI Itinerary</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="./samples/screen-20260912-042441_exported_57392.jpg" alt="Multi-Day Itinerary View" width="100%" />
        <br />
        <sub><b>📅 Multi-Day Day-wise Itinerary</b></sub>
      </td>
    </tr>
  </table>
</div>

---

## 🎬 Full Demo Video

Watch the complete end-to-end walkthrough demonstrating onboarding, interactive map discovery, search exploration, and AI itinerary generation:

<div align="center">

[Go to file](https://drive.google.com/file/d/1fdwcIu-PEz1ir1Ty-1IAjUNW75siFkqM/view?usp=drive_link) *(Local file available below)*

<video src="./samples/screen-20260912-042441.mp4" width="70%" controls="controls" poster="./samples/screen-20260912-042441_exported_7413.jpg">
  Your browser does not support the video tag. You can view the demo video directly at <a href="./samples/screen-20260912-042441.mp4"><code>./samples/screen-20260912-042441.mp4</code></a>.
</video>

</div>

> 💡 *Direct file path:* [`./samples/screen-20260912-042441.mp4`](./samples/screen-20260912-042441.mp4)

---

## 🌟 Feature Breakdown

### 1. Flexible Authentication & Multi-Provider Onboarding
Ghumo welcomes travelers with a frictionless onboarding experience. Users can authenticate using email & password, one-tap social logins (Google, Apple), Web3 & crypto providers (Binance, Web3 Wallet), or immediately explore in **Guest Mode** with zero upfront commitment. The screen also incorporates quick light/dark theme switching and dynamic branding.

<div align="center">
  <img src="./samples/screen-20260912-042441_exported_0.jpg" alt="Authentication & Onboarding Screen" width="400" />
</div>

---

### 2. Immersive Dark-Mode Map & Real-Time Geolocation
The home experience is powered by an unobstructed, full-screen OpenStreetMap engine rendered via Leaflet inside an optimized WebView. It features a custom high-contrast dark charcoal color filter, glowing real-time pulsing user location pin (`📍 You Are Here`), and floating glassmorphism search pills that never obscure navigation.

<div align="center">
  <img src="./samples/screen-20260912-042441_exported_7413.jpg" alt="Dark Map & Geolocation" width="400" />
</div>

---

### 3. Rapid Search & Discovery Hub
Searching in Ghumo is fast and responsive with strict API discipline. Users can search for cities, landmarks, or food hotspots without aggressive background rate-limiting. A swipeable glassmorphic bottom sheet offers quick category chips (*Forts & Palaces*, *Street Food & Chaat*, *Flea Markets*), recent search history, and curated budget-tagged starter inspirations.

<div align="center">
  <img src="./samples/screen-20260912-042441_exported_10450.jpg" alt="Destination Search" width="380" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./samples/screen-20260912-042441_exported_13304.jpg" alt="Search & Explore Sheet" width="380" />
</div>

---

### 4. Interactive POI Pins & Carousel Exploration
Search results are dynamically plotted on the map with animated pins. Tapping any pin or scrolling the horizontal card carousel smoothly flies the camera to the destination, showing ratings (e.g. `★ 4.8 / 5`), rich descriptions, category tags, quick direction triggers, and one-tap social sharing.

<div align="center">
  <img src="./samples/screen-20260912-042441_exported_19169.jpg" alt="Explore Jaipur POIs" width="400" />
</div>

---

### 5. Ghumo AI Travel Planner & YouTube Vlog Parsing
Plan full vacations and day trips effortlessly using Ghumo's AI Travel Planner. Simply type custom natural language prompts or paste any travel vlog YouTube URL (e.g. `https://youtu.be/...`). The AI engine analyzes the video or prompt, extracts key landmarks and culinary stops, and generates a structured, day-by-day travel guide.

<div align="center">
  <img src="./samples/screen-20260912-042441_exported_37593.jpg" alt="AI Planner Prompts" width="380" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./samples/screen-20260912-042441_exported_61401.jpg" alt="Generated YouTube Vlog Itinerary" width="380" />
</div>

---

### 6. Day-Wise Multi-Day Itineraries on Live Maps
AI-generated plans seamlessly synchronize with the interactive map. Travelers can toggle between **Day 1**, **Day 2**, and **Day 3** tabs, viewing numbered route waypoints, categorized stops (*Landmark*, *Food*, *Culture*), detailed local histories, and instant visit action links.

<div align="center">
  <img src="./samples/screen-20260912-042441_exported_57392.jpg" alt="Multi-Day Itinerary Map" width="400" />
</div>

---

## 🛠️ Tech Stack & Key Highlights

- **Framework**: Expo SDK 57 (React Native, TypeScript)
- **Map Architecture**: Leaflet.js + OpenStreetMap raster tiles (Zero API key dependencies, zero watermarks)
- **Backend & AI**: FastAPI backend, Supabase Authentication & Database, Google Gemini / LLM multi-modal trip synthesis
- **Styling**: Custom Design System with Warm Ivory (`#FAF6F0`) / Dark Charcoal (`#1B1918`) palettes and Glassmorphism components
- **Navigation**: Expo Router (file-based routing)
