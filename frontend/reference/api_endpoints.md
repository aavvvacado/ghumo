# Ghumo API & Endpoints Specification

This document details all backend endpoints utilized by the Ghumo mobile frontend application (`src/data/services/` and `src/context/homeContext.tsx`).

---

## Base URL Configuration

The mobile frontend automatically determines the backend base URL using:
1. `EXPO_PUBLIC_API_URL` from `.env`
2. Or fallback auto-resolution from `Constants.expoConfig?.hostUri` (extracting IP when running in Expo Go)
3. Default local fallback: `http://127.0.0.1:8000`

---

## 1. Search & Discovery Endpoints

### `GET /search`
Executes sub-200ms intelligence search over destinations, historical places, street food, hidden gems, and travel tips.

- **Query Parameters**:
  - `query` (string, required): Place or city name (e.g., `Chandaninchawk`, `Red Fort`, `Jaipur`).
  - `lat` (float, optional): Latitude for geo-proximity sorting.
  - `lng` (float, optional): Longitude for geo-proximity sorting.
  - `radius` (float, optional): Search radius in meters.
- **Response Schema**:
  ```json
  {
    "location": "Chandni Chowk, Old Delhi",
    "coordinates": { "lat": 28.6506, "lng": 77.2303 },
    "places": [
      {
        "id": "place_1",
        "name": "Chandarani Chowk Market",
        "city": "Old Delhi",
        "category": "Bazaars & Markets",
        "description": "Historic shopping street famous for street food and jewelry.",
        "lat": 28.6506,
        "lng": 77.2303,
        "rating": 4.8,
        "image": { "url": "https://...", "source": "wikimedia" },
        "hidden_gems": [
          { "name": "Kinari Bazaar Lace Alleys", "description": "Narrow alleyway specializing in wedding trims." }
        ],
        "tips": [
          { "tip_text": "Visit before 11 AM to beat peak crowds." }
        ]
      }
    ]
  }
  ```

---

### `GET /search/stream` (or `POST /search/stream`)
Real-time Server-Sent Events (SSE) streaming endpoint for live progress feedback during search aggregation.

- **Event Stream Format**:
  ```text
  data: {"step": "Searching OpenStreetMap data...", "progress": 25}
  data: {"step": "Synthesizing travel tips and gems...", "progress": 70}
  data: {"results": [...], "status": "completed"}
  ```

---

### `GET /suggestions`
Retrieves featured or trending spots verified with ratings and Wikimedia imagery.

- **Query Parameters**:
  - `limit` (integer, default: 10): Max number of suggestions to return.
  - `city` (string, optional): Filter by city.
  - `category` (string, optional): Filter by category.
- **Response**: Array of `PlaceSearchResult` items or `{ "suggestions": [...] }`.

---

### `GET /nearby`
Finds points of interest and food spots within proximity of a coordinate.

- **Query Parameters**:
  - `lat` (float, required): User or target latitude.
  - `lng` (float, required): User or target longitude.
  - `radius` (float, default: 2000): Radius in meters.
- **Response**:
  ```json
  {
    "places": [{ "name": "Town Park", "lat": 28.75, "lng": 77.49, "distance_meters": 450 }],
    "food": [{ "name": "Haldiram's", "lat": 28.751, "lng": 77.492, "distance_meters": 520 }]
  }
  ```

---

### `GET /hidden-gems`
Finds offbeat, lesser-known cultural spots.

- **Query Parameters**:
  - `location` (string, required): e.g., `Old Delhi`, `Faridabad`.
- **Response**: Array of `HiddenGemItem`.

---

### `GET /tips`
Retrieves community and AI-verified travel tips.

- **Query Parameters**:
  - `city` (string, optional)
  - `place_id` (integer, optional)
- **Response**: Array of `TravelTipItem`.

---

## 2. AI Travel Itinerary Endpoints

### `POST /itinerary`
Generates structured day-by-day travel plans using Gemini AI.

- **Request Body**:
  ```json
  {
    "prompt": "Plan a 2-day heritage and food tour in Delhi for 2 people under 5000 INR",
    "attachments": []
  }
  ```
- **Response**:
  ```json
  {
    "title": "2-Day Historic & Culinary Delhi Odyssey",
    "budget": "₹4,500 - ₹5,000",
    "budget_breakdown": {
      "stay": "₹2,000",
      "food": "₹1,500",
      "activities": "₹500",
      "transport": "₹500"
    },
    "days": [
      {
        "dayNumber": 1,
        "title": "Old Delhi Nostalgia & Street Food",
        "stay_recommendation": "Heritage Haveli in Chandni Chowk",
        "activities": [
          { "time": "09:00 AM", "name": "Jama Masjid", "description": "Morning tranquility at India's largest mosque." },
          { "time": "12:00 PM", "name": "Paranthe Wali Gali", "description": "Authentic stuffed paranthas." }
        ]
      }
    ],
    "markdown_table": "| Time | Stop | Activity |\n|---|---|---|\n| 09:00 AM | Jama Masjid | Visit |"
  }
  ```

---

### `POST /itinerary/video`
Extracts destination markers and an actionable itinerary directly from a YouTube travel vlog URL.

- **Request Body**:
  ```json
  {
    "video_url": "https://www.youtube.com/watch?v=..."
  }
  ```

---

## 3. Feedback & Rating Endpoints

### `POST /target-feedback`
Submits user ratings (1 to 5 stars) for destinations or generated itineraries to update Bayesian weighted scoring.

- **Request Body**:
  ```json
  {
    "user_id_or_anon": "aa6a6369-6f92-47db-984a-99ef334bb3746",
    "target_type": "place",
    "target_id": "place_1",
    "rating": 5
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "target_type": "place",
    "target_id": "place_1",
    "average_rating": 4.85,
    "rating_count": 24,
    "weighted_score": 4.79
  }
  ```

---

## 4. System & Health

### `GET /health`
Verifies backend connectivity, database status, and cache connection.
- **Response**:
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "cache": "connected"
  }
  ```
