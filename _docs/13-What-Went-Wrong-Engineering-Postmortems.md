---
layout: docs
title: "What Went Wrong: Technical Post-Mortems"
nav_order: 14
description: "8 authentic engineering post-mortems: Expo Go map key blockages, Overpass 429 bans, anchor landmark collisions, and event loop freezes."
---

# What Went Wrong: Technical Post-Mortems

Great engineering is defined by how technical obstacles, dead ends, and unexpected production edge cases are diagnosed and resolved. This document provides an honest, rigorous post-mortem analysis of **8 major technical hurdles** encountered during the architecture and construction of Ghumo.

---

## Post-Mortem 1: The Google Maps Key Wall on Android Expo Go

### The Failure Mode
Initially, the client interface integrated `react-native-maps` utilizing native Google Maps SDK on Android. During physical device testing via Expo Go, the map displayed an empty beige grid with watermarks. Android logs revealed Google Play Services rejecting tile requests due to missing Google Cloud API keys and unconfigured SHA-1 certificate fingerprints.

### Why It Failed
Google Maps on modern Android builds requires an active Google Cloud Billing account and hardcoded API keys embedded directly into the native AndroidManifest.xml. This introduced massive friction for public evaluation and open-source contribution.

### The Resolution: Leaflet.js in Hardware-Accelerated WebView
We eliminated `react-native-maps` entirely, replacing it with **Leaflet 1.9.4 inside `react-native-webview`** utilizing official OpenStreetMap raster tiles. We injected a custom CSS inversion shader (`invert(100%) hue-rotate(180deg) brightness(85%) contrast(92%)`), achieving an ultra-premium, dark charcoal cartographic canvas with **zero API keys, zero billing, zero watermarks, and 100% cross-platform reliability**.

---

## Post-Mortem 2: Nominatim & Overpass Rate Limits (HTTP 429 Bans)

### The Failure Mode
During multi-city testing, the backend abruptly ceased discovering physical POIs. Overpass API queries returned `HTTP 429 Too Many Requests` or dropped connections, stalling search responses for 30 seconds.

### Why It Failed
Overpass API and Nominatim operate strict public usage policies:
1. Nominatim requires an explicit, identifying `User-Agent` and limits requests to 1 request per second.
2. Naive Overpass queries without bounding radii scanned huge geographical polygons, triggering server-side memory limits.

### The Resolution
1. **Compliant User-Agent**: Configured descriptive headers identifying application and contact email across all outgoing HTTP sessions.
2. **Radial 8km Bounding Queries**: Replaced polygon scans with compact `around:8000, lat, lng` queries with strict `[timeout:25]`.
3. **Multi-Tier Caching**: Cached geocoding responses in Valkey for 7 days, eliminating redundant external lookups for repeated queries.

---

## Post-Mortem 3: The Anchor Landmark vs Parent City Collision Bug

### The Failure Mode
When a user searched for a specific institution—such as `"KIET Group of Institutions"`—the system resolved its coordinates to the parent town `"Muradnagar"`. However, the regional POI database returned generic municipal landmarks, completely omitting or burying the exact college campus the user had requested.

### Why It Failed
Conventional geo-search engines treat queries strictly at the municipality level. Because the college itself was a single POI entity rather than a municipality, the aggregation logic grouped by city, causing a collision where the target landmark was lost among regional noise.

### The Resolution: Layer 3 Anchor Landmark Elevation
We engineered the **Anchor Landmark Elevation Algorithm** inside `enrichment_service.py`:
1. When a query is received, the service tests if it matches an individual POI name in the `Place` database.
2. If matched, it fetches the surrounding city context (e.g. `Muradnagar`).
3. It converts the matched entity into a featured anchor card with a 1.0 confidence score, prepends it to the very front of the `attractions` category, and deduplicates all other records.

---

## Post-Mortem 4: Synthetic AI Image Hallucinations

### The Failure Mode
Early prototypes experimented with generative image models to generate preview cards for discovered locations. The AI frequently hallucinated fantasy imagery: generating five spires on *India Gate*, neon modern skyscrapers in *Hampi*, or impossible Mediterranean waterfalls in *Old Delhi*.

### Why It Failed
Generative diffusion models lack real-world geographical truth. For a travel navigation tool, displaying fantasy pictures of historical monuments destroys user trust.

### The Resolution: Multi-Source Creative Commons Resolution
We adopted a strict **Zero-Hallucination Policy**:
1. Built `PlaceQualityValidator` to filter out garbage names and placeholder strings.
2. Implemented `PlaceImageResolver` querying **Wikimedia Commons** and **Wikidata SPARQL** for verified real-world photographs with Creative Commons licenses.
3. Added non-blocking HTTP HEAD checks to verify that every photo link returns a valid `200 OK` image MIME type before rendering.

---

## Post-Mortem 5: Synchronous Crawlers Freezing the FastAPI Event Loop

### The Failure Mode
When an unindexed destination triggered live web crawlers (scraping travel blogs and mining YouTube transcripts), all concurrent search requests from other users stalled until the crawl finished.

### Why It Failed
Certain external scraping libraries (such as blocking `urllib` requests or synchronous DuckDuckGo search queries) were executed inside standard async FastAPI routes without offloading to worker threads, blocking the main Python asyncio event loop.

### The Resolution: Decoupled Non-Blocking Architecture
1. Converted all outbound HTTP network operations to non-blocking `httpx.AsyncClient`.
2. Offloaded compute-heavy scraping and fallback processing to `asyncio.create_task` or Celery task workers.
3. Implemented Server-Sent Events (SSE) streaming (`/search/stream`), allowing the frontend to receive incremental milestones while background tasks complete out-of-band.

---

## Post-Mortem 6: YouTube Transcript Mining Failures on Cloud Server IPs

### The Failure Mode
While `youtube_transcript_api` worked reliably on local development machines, deploying to cloud virtual servers caused transcript extraction to fail with `TranscriptsDisabled` or IP rate-limit blocks from YouTube.

### Why It Failed
Google actively rate-limits and blocks known cloud datacenter IP ranges (AWS, DigitalOcean, Hetzner) from accessing internal caption tracks.

### The Resolution: Dual-Engine Mining with `transcriptapi.com`
We engineered a multi-tiered transcript miner:
1. Integrated `transcriptapi.com` API with commercial API key authentication as the primary cloud extraction engine.
2. Retained `youtube_transcript_api` with proxy rotation as secondary fallback.
3. Added NLP metadata fallback via `yt-dlp` and DuckDuckGo search to extract itinerary waypoints from video descriptions and titles when subtitles are completely absent.

---

## Post-Mortem 7: WebView Gesture Collisions with Bottom Sheet Swipes

### The Failure Mode
On mobile devices, when users attempted to scroll the `DynamicBottomBar` sheet or swipe the `MapPlaceCarousel`, touch events were inadvertently captured by the underlying Leaflet WebView, causing the map to pan erratically rather than scrolling the UI cards.

### Why It Failed
Both the Leaflet WebView and React Native's gesture responders were competing for touch responder status at the root window level.

### The Resolution: Dynamic Pointer Event Gating
1. Added dynamic `pointerEvents` control to the map layer:
   ```tsx
   <View 
     style={[StyleSheet.absoluteFill, { zIndex: isMapVisible ? 1 : -1 }]} 
     pointerEvents={isMapVisible && !isSheetDragging ? 'auto' : 'none'}
   >
     <MapBackground />
   </View>
   ```
2. When bottom sheets expand or cards drag, `pointerEvents` temporarily switches to `'none'`, routing 100% of touch gestures exclusively to React Native gesture handlers.

---

## Post-Mortem 8: Memory Pressure from Map Re-Renders

### The Failure Mode
In early iterations, navigating away from the home screen unmounted `MapBackground`, and returning remounted it. After 4-5 screen transitions, the mobile app experienced memory leaks, stuttering animations, and eventual WebView crashes on budget Android devices.

### Why It Failed
Remounting a Leaflet WebView forces the operating system to allocate a new WebGL rendering context and fetch new tile images into VRAM. Garbage collection of old WebGL contexts on Android WebViews is delayed, causing memory exhaustion.

### The Resolution: Persistent Layer 1 Canvas
We refactored `HomeScreen` so that `MapBackground` remains **permanently mounted at Layer 1**. When the user hides the map, the component simply updates its opacity to `0` and sets `pointerEvents="none"` rather than unmounting the WebView DOM. This reduced app memory consumption from 280MB to a steady 95MB.
