<div align="center">
  <img src="apps/web/public/favicon.svg" alt="PRISME Logo" width="100"/>
  <h1>PRISME | India's Energy Command</h1>
  <p><b>Predictive Risk & Inventory Simulation for Maritime Energy</b></p>
  
  [![Live Deployment](https://img.shields.io/badge/Live_Deployment-Active-gold?style=for-the-badge)](https://prisme-puce-nu.vercel.app)
  [![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](#)
</div>

---

## Overview

**PRISME** is an AI-powered, military-grade supply chain resilience platform built to secure India's crude oil procurement. By combining graph theory mathematics with generative AI, PRISME actively monitors global geopolitical events and automatically calculates the most cost-effective and secure maritime detours during supply chain disruptions.

## Algorithmic Deep Dive (The Mathematics of Resilience)

To understand how PRISME secures the supply chain, it is essential to understand the underlying mathematics. PRISME does not rely on static fallback routes; it computes optimal detours in real-time by marrying **Graph Theory** with **Natural Language Processing (NLP)**.

### 1. The Global Maritime Graph (Base Infrastructure)
The world's shipping lanes are modeled as a weighted, undirected graph `G = (V, E)` using the Python `NetworkX` library.
*   **Vertices (V):** Represent Origin Ports (e.g., Sohar, Ras Tanura, US Gulf), Destination Refineries (e.g., Mumbai, Jamnagar), and Maritime Nodes.
*   **Edges (E):** Represent the navigable shipping corridors connecting these vertices.
*   **Base Weights (w):** The base weight of any edge is the strict nautical distance (in nautical miles, `nm`) between two nodes, translating directly to transit days.

### 2. Live Intelligence Threat Multipliers (NLP Integration)
When a geopolitical event occurs, raw unstructured news headlines are intercepted by our backend engine. 
*   **LLM Processing:** **Google Gemini 1.5 Flash** ingests the headline and performs sentiment and entity extraction.
*   **Probability Scoring:** The LLM assigns a probability-based `Threat Multiplier` (`T`) ranging from `0.0` (Safe) to `1.0` (Total Blockade) for specific geographic chokepoints (e.g., Strait of Hormuz, Suez Canal).
*   *Resilience Note:* If the LLM API fails, the system safely falls back to a deterministic regex-keyword engine to calculate the threat multiplier, ensuring 100% uptime.

### 3. Dynamic Edge Weight Inflation (The Cost Function)
The routing engine applies the `Threat Multiplier` (`T`) to the base graph. The *effective* cost (`C`) of traveling across an edge is calculated as:

`C(e) = BaseDistance(e) × (1 + λ × T_chokepoint)`

Where `λ` is a penalty scaling factor (currently set to `100` in PRISME to heavily penalize highly compromised corridors). 
*   *Example:* If the Strait of Hormuz (`100nm` base distance) experiences a severe military blockade (`T = 0.98`), its effective algorithmic cost explodes from `100` to nearly `10,000`. 

### 4. Optimal Pathfinding (Dijkstra's Algorithm)
With the graph dynamically inflated by real-world risk, PRISME executes **Dijkstra's Shortest Path Algorithm** to find the path with the lowest cumulative cost from all possible origin ports to India's refineries.

Because compromised corridors now have astronomically high mathematical costs, the algorithm organically discards them and "discovers" strategic detours—such as shifting procurement from the Middle East to West Africa or the Americas—identifying the absolute safest and fastest contingency route.

---

## Core Features

### The "Brain" (Backend Intelligence)
*   **Graph Theory Routing:** Actively inflates distance penalties based on live geopolitical risk multipliers to recalculate optimal maritime detours.
*   **NLP Intelligence Engine:** Integrates Google Gemini 1.5 Flash to process unstructured geopolitical news headlines.
*   **Real-time Synchronization:** Built on a completely asynchronous `FastAPI` architecture, communicating with the frontend exclusively via low-latency WebSockets.

### The "Beauty" (Frontend UX)
*   **Tactical Brutalism:** A highly optimized, custom CSS "glassmorphism" UI tailored for high-contrast visibility and a military-grade aesthetic.
*   **Interactive Cartography:** Deep integration with `react-leaflet` providing a live, animated map of active supply corridors that react instantly to API updates.
*   **Progressive Disclosure:** Complex mathematical data is abstracted away behind sleek UI components, but available for deep-dive analysis via `framer-motion` animated modals.
*   **SIM Mode:** A built-in catastrophic simulation engine that allows users to force the system through extreme stress-test scenarios.

## Technology Stack

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

## Local Run Instructions

To run PRISME locally, you will need to start both the Frontend development server and the Backend API server.

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   A Google Gemini API Key

### 1. Backend Setup (FastAPI)
```bash
# Navigate to the backend directory
cd apps/api

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
cd apps/web

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The frontend will now be running on `http://localhost:5173`*

---

## Deployment Architecture & Hackathon Strategy


*   **Frontend Deployment:** `https://prisme-puce-nu.vercel.app`
*   **Backend WebSocket URL:** `wss://prisme-backend-mduw.onrender.com/ws`

### Hackathon Evaluation Notice: The 14-Minute Ping Strategy
Because hackathon judges evaluate projects asynchronously, we utilize a free tier hosting strategy that prevents backend servers from "spinning down" or sleeping during periods of inactivity.

*   **Backend Host:** Render.com (FastAPI Web Service)
*   **Frontend Host:** Vercel.com (React/Vite Static Site)
*   **The Sleep Problem:** Render's free tier automatically suspends web services after 15 minutes of inactivity. If a judge visits the frontend while the backend is asleep, the WebSocket connection will time out.
*   **The Solution:** We utilize [cron-job.org](https://cron-job.org) to send a lightweight HTTP GET request to our Render backend URL every **14 minutes**. This ensures the backend remains active 24/7 without incurring charges, guaranteeing a flawless, instant experience for the judges regardless of when they review the submission.
