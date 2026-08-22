<div align="center">
  <img src="apps/web/public/favicon.svg" alt="PRISME Logo" width="100"/>
  <h1>PRISME | India's Energy Command</h1>
  <p><b>Predictive Risk & Inventory Simulation for Maritime Energy</b></p>
  
  [![Live Deployment](https://img.shields.io/badge/Live_Deployment-Coming_Soon-gold?style=for-the-badge)](#)
  [![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](#)
</div>

---

## 🌍 Overview

**PRISME** is an AI-powered, military-grade supply chain resilience platform built to secure India's crude oil procurement. By combining graph theory mathematics with generative AI, PRISME actively monitors global geopolitical events and automatically calculates the most cost-effective and secure maritime detours during supply chain disruptions.

## 🚀 Core Features

### 🧠 The "Brain" (Backend Intelligence)
*   **Algorithmic Routing (Dijkstra):** Utilizes Python's `NetworkX` to construct a graph of the global maritime network. It dynamically inflates edge weights based on live geopolitical threat scores, mathematically forcing the pathfinding algorithm to seek alternative global origin ports when primary corridors (e.g., Strait of Hormuz) are compromised.
*   **NLP Intelligence Engine:** Integrates **Google Gemini 1.5 Flash** to ingest real-time, unstructured geopolitical news headlines and extract probabilistic threat severity scores for specific maritime chokepoints.
*   **Resilient Fallbacks:** Features an internal Regex-based keyword engine to ensure continuous operation even if the primary LLM API becomes unavailable.
*   **Real-time Synchronization:** Built on a completely asynchronous `FastAPI` architecture, communicating with the frontend exclusively via low-latency WebSockets.

### 🎨 The "Beauty" (Frontend UX)
*   **Tactical Brutalism:** A highly optimized, custom CSS "glassmorphism" UI tailored for high-contrast visibility and a military-grade aesthetic.
*   **Interactive Cartography:** Deep integration with `react-leaflet` providing a live, animated map of active supply corridors that react instantly to API updates.
*   **Progressive Disclosure:** Complex mathematical data is abstracted away behind sleek UI components, but available for deep-dive analysis via `framer-motion` animated modals (e.g., Cost Analysis, Routing Strategy).
*   **SIM Mode:** A built-in catastrophic simulation engine that allows users to force the system through extreme stress-test scenarios (like a full blockade of the Middle East) to demonstrate the routing algorithm in real-time.

## 🛠️ Technology Stack

**Frontend:**
*   **Framework:** React 18 (Vite)
*   **Styling:** Vanilla CSS (Glassmorphism, CSS Grid)
*   **Mapping:** React-Leaflet (`leaflet`)
*   **Data Visualization:** Recharts
*   **Animation:** Framer Motion

**Backend:**
*   **Framework:** FastAPI (Python) & Uvicorn
*   **Graph Mathematics:** NetworkX
*   **AI/NLP:** Google Generative AI (Gemini 1.5 Flash)
*   **Communication:** WebSockets (`asyncio`)

---

## 💻 Local Run Instructions

To run PRISME locally, you will need to start both the Frontend development server and the Backend API server.

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   A Google Gemini API Key

### 1. Backend Setup (FastAPI)
```bash
# Navigate to the backend directory
cd prisme/apps/api

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn websockets networkx google-generativeai

# Set your Gemini API Key
# On Windows:
set GEMINI_API_KEY=your_api_key_here
# On Mac/Linux:
export GEMINI_API_KEY=your_api_key_here

# Start the server
python -m uvicorn main:app --port 8000 --reload
```
*The backend will now be running on `ws://localhost:8000/ws`*

### 2. Frontend Setup (React/Vite)
Open a **new** terminal window:
```bash
# Navigate to the frontend directory
cd prisme/apps/web

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The frontend will now be running on `http://localhost:5173`*

---

## 🌐 Deployment Architecture

*(Deployment links will be updated here prior to final submission)*

*   **Frontend Deployment:** `[LINK COMING SOON]`
*   **Backend WebSocket URL:** `[LINK COMING SOON]`

*(See the deployment guide below for infrastructure details).*
