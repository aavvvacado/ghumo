# Ghumo Backend & Local Development Setup Guide

A developer reference guide for running the **Ghumo FastAPI Backend** and connecting it with the **Ghumo React Native / Expo Mobile App**.

---

## 1. Backend Prerequisites

- **Python**: 3.10 or higher (Python 3.11/3.13 recommended)
- **Supabase Account**: PostgreSQL database & Auth provider
- **Gemini API Key**: For AI itinerary generation (`gemini-3.5-flash` / `gemini-3.6-flash`)
- **Valkey / Redis** (Optional): For response caching

---

## 2. Backend Installation & Setup

### Step 1: Navigate to Backend Directory
```powershell
cd path/to/ghumo_backend
```

### Step 2: Create & Activate Virtual Environment
```powershell
# Create virtual environment
python -m venv .venv

# Activate on Windows (PowerShell)
.\.venv\Scripts\activate

# Activate on macOS / Linux
source .venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables (`.env`)
Create a `.env` file in the root of `ghumo_backend`:

```env
# Database & Auth
SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Model
GEMINI_API_KEY=your_gemini_api_key

# Cache & Redis (Optional)
VALKEY_URL=redis://localhost:6379/0
```

---

## 3. Running the Backend Server

To allow **physical Android/iOS devices** and **emulators** on your local Wi-Fi to connect to your backend server, you **MUST** bind Uvicorn to `--host 0.0.0.0`:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> [!IMPORTANT]
> Do NOT run with `--host 127.0.0.1` if you are testing on a physical mobile phone. Bounding to `--host 0.0.0.0` ensures the server listens on all network cards.

---

## 4. Connecting the Mobile App (Ghumo Frontend)

### Step 1: Find Your Computer's Local IP Address
- On Windows: Run `ipconfig` in PowerShell and look for `IPv4 Address` (e.g. `10.16.237.241` or `192.168.1.10`).
- On macOS: Run `ifconfig` or check **System Settings -> Network**.

### Step 2: Set `EXPO_PUBLIC_API_URL` in Frontend `.env`
In your `ghumo` React Native project root, create or update `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_key
EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:8000
```

*Example:*
```env
EXPO_PUBLIC_API_URL=http://10.16.237.241:8000
```

### Step 3: Launch Expo App with Clean Cache
```bash
npx expo start -c
```

---

## 5. API Documentation & Verification

Once your backend is running:

| Device / Access | URL | Description |
| :--- | :--- | :--- |
| **PC Browser** | `http://127.0.0.1:8000/docs` | Interactive Swagger API Docs |
| **Mobile Phone** | `http://<YOUR_COMPUTER_IP>:8000/docs` | Mobile test connection |
| **Health Check** | `http://127.0.0.1:8000/health` | Verifies DB & Cache status |

---

## 6. Key Backend API Endpoints Summary

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/search` | `GET` | Sub-200ms intelligence search for places, food, & tips |
| `/search/stream` | `GET/POST` | SSE progress stream during map scanning & AI synthesis |
| `/suggestions` | `GET` | Hot/trending places with verified Wikimedia images & ratings |
| `/itinerary` | `POST` | AI-driven day-wise or time-wise travel itinerary generation |
| `/itinerary/stream` | `POST` | Live SSE streaming itinerary planner |
| `/itinerary/video` | `POST` | Mine places & itinerary directly from a YouTube vlog URL |
| `/target-feedback` | `POST` | Submit 1–5 star user ratings for places or itineraries |
| `/nearby` | `GET` | Search POIs within a geographic radius |
| `/hidden-gems` | `GET` | Offbeat recommendations by location |
| `/tips` | `GET` | Travel tips by city or place ID |
| `/health` | `GET` | Health check for PostgreSQL & Valkey |

---

## 7. Common Developer Troubleshooting

### A. `java.net.ConnectException: Failed to connect to /127.0.0.1:8000`
- **Cause**: The phone tried connecting to `127.0.0.1` on the phone itself instead of your PC.
- **Fix**: Ensure Uvicorn is started with `--host 0.0.0.0` and `EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:8000` is set in the mobile app `.env`.

### B. Google OAuth Error: `missing OAuth secret`
- **Cause**: Google Provider in Supabase Dashboard does not have a Client Secret.
- **Fix**: Create a **Web Application** client ID in Google Cloud Console, then paste the Client ID & Client Secret into Supabase Dashboard -> **Authentication** -> **Providers** -> **Google**.

### C. `Google sign-in was cancelled`
- **Cause**: Supabase blocked redirect back to Expo Go.
- **Fix**: Add `exp://<YOUR_IP>:8081/--/` and `ghumo://` under **Authentication** -> **URL Configuration** -> **Redirect URLs** in Supabase Dashboard.
