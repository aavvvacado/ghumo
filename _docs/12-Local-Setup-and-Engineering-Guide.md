---
layout: docs
title: "Local Setup, Testing & Verification Guide"
nav_order: 13
description: "Step-by-step engineering guide for running the FastAPI backend, Expo React Native frontend, Supabase migrations, and test suites."
---

# Local Setup, Testing & Verification Guide

This guide provides end-to-end setup instructions for evaluating, developing, and running both the **Backend** and **Frontend** services of Ghumo on a local machine or physical mobile device.

---

## 1. System Prerequisites

| Dependency | Minimum Version | Verification Command | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.0.0+` | `node -v` | Frontend JavaScript / Expo runtime |
| **Python** | `3.10+` (3.11 recommended) | `python --version` | FastAPI backend & crawler microservices |
| **Git** | `2.30+` | `git --version` | Version control & monorepo management |
| **Expo Go** | Latest (Mobile App) | App Store / Play Store | Physical mobile device testing |
| **Valkey / Redis** | Optional | `redis-cli ping` | In-memory query acceleration |

---

## 2. Backend Setup & Startup Guide

### Step 1: Navigate and Create Virtual Environment
```powershell
# Navigate to the backend directory
cd backend

# Create an isolated Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows PowerShell:
.\venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate
```

### Step 2: Install Python Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy `.env.example` to create your active `.env` configuration:
```powershell
# On Windows:
copy .env.example .env
# On Linux / macOS:
cp .env.example .env
```

Ensure the following keys are configured inside `backend/.env`:
```ini
# Database Connection (Supabase PostgreSQL or Local Postgres)
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# AI Reasoning Providers
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...

# Optional Caching (System operates smoothly even if unset)
VALKEY_HOST=localhost
VALKEY_PORT=6379

# Transcript API (For YouTube vlog mining)
TRANSCRIPT_API_KEY=tra_...
```

### Step 4: Run Database Migration & Sequence Sync
```powershell
python migrate_to_supabase.py
```
This script ensures all required tables (`places`, `hidden_gems`, `ai_contexts`, `travel_tips`, `user_feedback`, `local_contributions`) are created and primary key auto-increment sequences are synchronized.

### Step 5: Start the FastAPI Server
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> **CRITICAL RULE**: The `--host 0.0.0.0` flag is **MANDATORY**. If bound only to `127.0.0.1`, physical smartphones on your local Wi-Fi network will be blocked by the operating system from reaching your backend API.

The backend will be live at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Health Diagnostic**: `http://localhost:8000/health`

---

## 3. Frontend Setup & Startup Guide

### Step 1: Navigate and Install NPM Packages
Open a **new terminal window** and navigate to the frontend directory:
```powershell
cd frontend
npm install
```

### Step 2: Configure Frontend Environment Variables
```powershell
# On Windows:
copy .env.example .env
# On Linux / macOS:
cp .env.example .env
```

Open `frontend/.env` and point `EXPO_PUBLIC_API_URL` to your computer's local Wi-Fi IP address:
```ini
# Find your IP via 'ipconfig' (Windows) or 'ifconfig' (macOS/Linux)
EXPO_PUBLIC_API_URL=http://192.168.1.15:8000
```
> **Note**: Do NOT use `localhost` or `127.0.0.1` if you plan to scan the QR code and test on a physical smartphone, because `localhost` on the phone refers to the phone itself.

### Step 3: Launch the Expo Development Server
```powershell
npx expo start
```

### Step 4: Run the Application
- **Web Browser**: Press `w` in the terminal to launch the web client at `http://localhost:8081`.
- **Physical Phone**: Open the **Expo Go** app on Android or iOS and scan the terminal QR code.
- **Android Emulator**: Press `a` in the terminal (with an Android Studio AVD running).

---

## 4. Multi-Device LAN Firewall Troubleshooting

If your physical smartphone fails to connect to `http://<YOUR_IP>:8000`:
1. Ensure your computer and smartphone are connected to the **same Wi-Fi network**.
2. On Windows, allow inbound traffic on port 8000 via PowerShell (Run as Administrator):
   ```powershell
   New-NetFirewallRule -DisplayName "FastAPI Ghumo Dev" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   ```

---

## 5. Automated Verification & Quality Assurance

### Run Backend Pytest Suite
```powershell
cd backend
pytest tests/
```
Verifies geocoding resolution, search fallback tiers, and itinerary synthesis schemas.

### Run Frontend TypeScript Strict Validation
```powershell
cd frontend
npx tsc --noEmit
```
Confirms **0 TypeScript compilation errors** across all components, domain models, and context providers.
