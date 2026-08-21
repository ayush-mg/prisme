# India Energy Command Center (PRISME)

An AI-driven supply chain resilience platform designed to model and respond to geopolitical risks (like Strait of Hormuz closures or Red Sea attacks) in real-time, redirecting India's energy procurement safely and efficiently.

## Features
- **Real-Time Geopolitical Risk NLP Engine**: Parses live news using Gemini API (or a robust offline keyword matcher) to dynamically calculate risk per shipping corridor.
- **Adaptive NetworkX Routing Engine**: Uses Dijkstra's algorithm across a 76-edge, 25-port global maritime grid, recalculating the optimal crude procurement route when a corridor becomes risky.
- **Strategic Petroleum Reserve (SPR) Simulator**: Automatically calculates economic impact (GDP penalty) and SPR drawdown rates when optimal shipping routes exceed 10 transit days.
- **Demo / Live Mode Toggle**: Clean separation between a presentation-safe "Demo Mode" (cycles 55 simulated crisis headlines offline) and a production "Live Mode" (RSS ingestion + LLM risk parsing with SHA-256 hash quota protection).
- **Cinematic React Leaflet Dashboard**: Premium dark-mode UI with pulsing components, real-time matrix updates via WebSocket, and adaptive ranking charts.

## Tech Stack
**Backend**: Python, FastAPI, Uvicorn, NetworkX, `urllib.request` (zero heavy SDKs for Gemini calls), `python-dotenv`.
**Frontend**: React (Vite), Tailwind CSS v4, React Leaflet, Recharts, Framer Motion, Lucide React.
**Data**: Stateless JSON grid telemetry (25 origin ports, 15 refineries, 6 chokepoints).

## How to Run Locally

### 1. Backend Setup
```bash
# From the project root
pip install -r requirements.txt

# Add your Gemini API key to .env
# geminiapikey=YOUR_KEY_HERE

# Start the FastAPI server (runs on port 8000)
cd apps/api
python -m uvicorn main:app --port 8000
```

### 2. Frontend Setup
```bash
# In a new terminal, from the project root
cd apps/web
npm install
npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173`. 
The application will start in **Demo Mode** by default. Click "LIVE" in the top right to switch to real-time RSS/Gemini parsing.

## Deployment Notes
- **WebSocket URL**: The frontend is configured to use `VITE_WS_HOST` if deployed, otherwise it falls back to `window.location.hostname:8000`.
- **API Quota Protection**: The backend hashes incoming news strings. The Gemini API is ONLY called if the hash changes, preventing quota exhaustion during 24-hour deployments.
- **Crash Isolation**: Every module call is wrapped in a try-except block that injects a deterministic fallback object. The system will not crash if the LLM hallucinating bad JSON or if an RSS feed goes down.
