# Ghumo Backend Setup & Startup Guide

This document explains how to set up, configure, and launch the **Ghumo FastAPI Backend** so that it reliably serves the React Native / Expo mobile application.

---

## 1. Repository & Directory

- **Backend Directory**: `ghumo_backend` (e.g., `C:\Users\<user>\Documents\Ghumo\ghumo_backend`)
- **Framework**: FastAPI + Uvicorn
- **Database / Auth**: Supabase (PostgreSQL + GoTrue Auth)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-2.0-flash`)
- **Cache Engine**: Valkey / Redis (Port `6379`)

---

## 2. Environment Preparation

### Activate Python Virtual Environment
```powershell
# Windows PowerShell
.\venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Configuration (`.env`)
Ensure `.env` in the backend root has:
```env
# Database & Auth
SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key

# Cache & Discovery (Optional)
VALKEY_URL=redis://localhost:6379/0
```

---

## 3. Starting the Backend Server

### Crucial Command:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> [!IMPORTANT]
> **Why `--host 0.0.0.0` is required:**
> If you start Uvicorn with `127.0.0.1` (the default), only your computer's local browser can access it. Physical mobile phones running the Expo app over Wi-Fi will throw `java.net.ConnectException: Failed to connect`. Specifying `--host 0.0.0.0` binds the server across all network interfaces so mobile devices can connect.

> [!NOTE]
> **Why `app.main:app`:**
> The FastAPI application instance is located inside the `app/` package in `app/main.py`. Running `main:app` directly from the root will fail with `ImportError`.

---

## 4. Connecting the Mobile App (Frontend)

1. Find your computer's local Wi-Fi IP address:
   ```powershell
   # Windows
   ipconfig
   # Look for "IPv4 Address", e.g., 10.16.237.241 or 192.168.1.15
   ```
2. Update `.env` in the `ghumo` mobile app root:
   ```env
   EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000
   ```
   *Example:*
   ```env
   EXPO_PUBLIC_API_URL=http://10.16.237.241:8000
   ```
3. Start the Expo app:
   ```bash
   npx expo start -c
   ```

---

## 5. Verification & Health Checks

- **Swagger Documentation**: Open `http://127.0.0.1:8000/docs` in your browser.
- **Health Check**: Open `http://127.0.0.1:8000/health`. You should receive:
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "cache": "connected"
  }
  ```
- **Mobile Connection Check**: Open `http://<YOUR_LOCAL_IP>:8000/health` directly in your phone's browser while connected to the same Wi-Fi.
