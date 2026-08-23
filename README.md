<div align="center">
  <img src="apps/web/public/favicon.svg" alt="PRISME Logo" width="100"/>
  <h1>PRISME | India's Energy Command</h1>
  <p><b>Predictive Risk & Inventory Simulation for Maritime Energy</b></p>
  
  [![Live Deployment](https://img.shields.io/badge/Live_Deployment-Active-gold?style=for-the-badge)](https://prisme-puce-nu.vercel.app)
  [![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](#)
</div>

---

> **India imports 85% of its crude oil. One blocked chokepoint can cripple the economy overnight.**

PRISME is a real-time maritime supply chain resilience platform that models the entire global crude oil shipping network as a mathematical graph, continuously monitors geopolitical threats, and instantly computes optimal strategic detours when corridors are compromised.

Instead of relying on static contingency plans or human analysts reacting to crises after the fact, PRISME treats every shipping lane, port, refinery, and chokepoint as vertices and edges in a weighted graph. When a geopolitical event occurs anywhere on the planet, the system dynamically recalculates the safest, fastest, and most cost-effective route to keep India's crude oil supply uninterrupted.

**Threat Detection → Risk Quantification → Graph Inflation → Optimal Rerouting → Economic Impact Forecast**

PRISME combines Graph Theory pathfinding, NLP-driven threat extraction, real-time WebSocket streaming, Strategic Petroleum Reserve drawdown simulation, and GDP impact forecasting into a single, live tactical operations interface.

---

## The Problem

India is the world's third-largest crude oil importer. Over 5 million barrels flow into Indian refineries every single day. But this supply depends on a handful of narrow maritime chokepoints:

- **Strait of Hormuz** — 21 million BPD of global oil flows through a passage just 33km wide
- **Bab el-Mandeb / Red Sea** — 6.2 million BPD transit this chokepoint between Yemen and Djibouti
- **Suez Canal** — 5.5 million BPD pass through a single man-made waterway
- **Strait of Malacca** — 16 million BPD squeeze through Southeast Asia's narrowest passage

A single crisis — an Iranian mine deployment, a Houthi missile strike, a canal blockage — can instantly sever India's crude supply.

The consequences are not hypothetical:

- Strategic Petroleum Reserves provide only **9.5 days** of national consumption coverage
- A blocked Hormuz alone cuts off access to **60% of India's crude imports**
- Every delayed day of supply costs the Indian economy **$425 million in GDP**
- Current contingency planning is largely static, manual, and reactive

**The problem is not detecting that a crisis has occurred. The problem is computing the optimal response in real-time, before the supply gap materialises.**

---

## What PRISME Does

PRISME continuously monitors global geopolitical events and mathematically determines the best alternative supply routes in real-time.

When a crisis headline is detected:

1. Parse the raw intelligence and identify which maritime corridors are threatened
2. Assign a quantified probability-based Threat Multiplier (0.0 to 1.0) to each corridor
3. Dynamically inflate the mathematical cost of traversing compromised edges in the global shipping graph
4. Execute Dijkstra's shortest path algorithm across the entire network to discover the optimal detour
5. Calculate the resulting transit delay and its impact on India's Strategic Petroleum Reserve
6. Forecast the projected GDP penalty to the Indian economy in real-time
7. Display the top 3 alternative routes on a live tactical map with full cost breakdowns

This happens continuously. Every time a new piece of intelligence arrives — whether from a live RSS feed or a simulated crisis scenario — the entire graph is recalculated and the optimal strategy is updated.

---

## The Mathematics of Resilience

PRISME does not use static fallback routes or lookup tables. It computes optimal detours in real-time by combining **Graph Theory** with **Natural Language Processing**.

### 1. The Global Maritime Graph `G = (V, E)`

The world's shipping infrastructure is modelled as a weighted, undirected graph using the Python `NetworkX` library.

```
                     GLOBAL MARITIME NETWORK
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
        VERTICES (V)      EDGES (E)       WEIGHTS (W)
            │                 │                 │
     ┌──────┼──────┐    Navigable         Base: Nautical
     │      │      │    Shipping          Distance (nm)
     │      │      │    Corridors         Dynamic: Risk
  Origin  Choke  Indian                   Multiplied
  Ports   Points Refineries               Cost
```

**Vertices (V):** The graph contains 5 distinct node types:

| Node Type | Count | Examples |
|---|---|---|
| Origin Ports | 25 | Ras Tanura (Saudi Arabia), Basra (Iraq), Bonny (Nigeria), Houston (USA), Kozmino (Russia) |
| Chokepoints | 6 | Strait of Hormuz, Bab el-Mandeb, Suez Canal, Cape of Good Hope, Strait of Malacca, Mozambique Channel |
| Indian Refineries | 15 | Jamnagar RIL (1.24M BPD), Vadinar Nayara (400K BPD), Paradip IOCL (300K BPD), Kochi BPCL (310K BPD) |
| SPR Locations | 4 | Visakhapatnam (1.33M tonnes), Mangalore (1.5M tonnes), Padur (2.5M tonnes), Chandikhol (4M tonnes, under construction) |
| Maritime Waypoints | 16 | Arabian Sea Central, Bay of Bengal, Caribbean, South Atlantic |

**Edges (E):** 76 edges connect these vertices, representing real navigable shipping corridors with calibrated nautical mile distances and transit day estimates.

**Base Weights (W):** The base weight of any edge is the strict nautical distance (`nm`) between two nodes, which translates directly to transit days at standard tanker speed.

### 2. Live Intelligence Threat Multipliers

When a geopolitical event occurs, raw unstructured news headlines are intercepted and processed into quantified corridor risk scores.

```
RAW HEADLINE
     │
     ▼
"Iran deploys naval mines across
 Strait of Hormuz shipping lanes"
     │
     ├──── [LIVE MODE] ──────────────────┐
     │     Gemini 1.5 Flash LLM          │
     │     Entity extraction +           │
     │     probability scoring           │
     │                                   │
     ├──── [DEMO MODE] ──────────────────┤
     │     Deterministic keyword         │
     │     parser (offline, no API)      │
     │                                   │
     ├──── [FALLBACK] ──────────────────┤
           If LLM fails, automatic      │
           fallback to keyword parser   │
     │                                   │
     ▼                                   ▼
CORRIDOR RISK SCORES (0.0 → 1.0)
┌──────────────────────────────┐
│ hormuz:    0.95              │
│ redsea:    0.20              │
│ suez:      0.10              │
│ malacca:   0.05              │
│ westafrica: 0.10             │
│ usgulf:    0.08              │
│ pacific:   0.05              │
│ americas:  0.05              │
│ cape:      0.02              │
└──────────────────────────────┘
```

The keyword parser is not a placeholder. It is a fully engineered deterministic extraction engine with **72 weighted keyword-to-corridor mappings** covering geopolitical terms (e.g., "IRGC" → Hormuz 0.8, "Houthi" → Red Sea 0.85, "pipeline vandal" → West Africa 0.7) and escalation modifiers (e.g., "blockade" adds +0.20, "100%" adds +0.25).

**Resilience Note:** If the Gemini API fails (rate limit, quota, network), the system silently falls back to the keyword parser. The routing engine never stops computing. There is no single point of failure.

### 3. Dynamic Edge Weight Inflation

The routing engine applies the Threat Multiplier to every edge in the graph. The effective cost of traversing an edge is:

```
C(e) = BaseDistance(e) × RiskMultiplier

Where:
  RiskMultiplier = max(1.0,  1.0 + CorridorRisk × λ)
  λ (chokepoint penalty) = 10
  λ (corridor penalty) = 5
```

**Example:**

| Scenario | Base Distance | Threat | Multiplier | Effective Cost |
|---|---|---|---|---|
| Hormuz (peacetime) | 250 nm | 0.05 | 1.0 | 250 |
| Hormuz (crisis, T=0.95) | 250 nm | 0.95 | 10.5 | 2,625 |
| Cape of Good Hope (safe) | 4,000 nm | 0.02 | 1.0 | 4,000 |

When Hormuz is under severe threat, its effective cost explodes from 250 to 2,625. Even though the Cape of Good Hope is physically 16x further, its effective cost of 4,000 is now *cheaper* than the compromised Hormuz corridor. The routing algorithm organically "discovers" the strategic detour.

### 4. Optimal Pathfinding (Dijkstra's Algorithm)

With the graph dynamically inflated by real-world risk, PRISME executes **Dijkstra's Shortest Path Algorithm** across all permutations of origin-to-refinery pairs.

```
For each Origin Port (25):
  For each Indian Refinery (15):
    Execute Dijkstra(G, origin, refinery, weight="cost")
    Record: path, total cost, transit days, distance, chokepoints traversed

Sort all discovered routes by (total_cost, transit_days)
Select top 20 diverse routes (prioritising unique origin ports)
Present top 3 to the operator
```

Because compromised corridors now carry astronomically high mathematical costs, the algorithm organically discards them and discovers strategic alternatives — such as shifting procurement from the Persian Gulf to West Africa, the Americas, or Russia's Pacific ports.

### 5. Strategic Petroleum Reserve Drawdown Model

Once the optimal route is determined, PRISME calculates the downstream economic impact:

```
Standard Transit Time = 4 days (peacetime Gulf → India)

If BestRouteTransit > StandardTransit:
    ExtraDays = BestRouteTransit - StandardTransit
    DrawdownDays = min(ExtraDays, SPR_CoverageDays)
    DeficitBarrels = DrawdownDays × NationalConsumption_BPD
    RemainingCoverage = SPR_CoverageDays - DrawdownDays
    GDP_Penalty = DeficitBarrels × GDP_Impact_Per_Barrel

    If ExtraDays > SPR_CoverageDays:
        Status = "STOCKOUT"  ← National supply exhausted
    Else:
        Status = "CRITICAL"  ← Reserve being drawn down
Else:
    Status = "STABLE"  ← No drawdown required
```

**Real-world calibration:**
- National consumption: **5,000,000 BPD**
- SPR total capacity: **39 million barrels** (5.33 million tonnes across 4 caverns)
- SPR coverage: **9.5 days**
- GDP impact per barrel: **$85**

This means a single extra day of transit delay costs:
`5,000,000 × $85 = $425,000,000 GDP impact per day`

### 6. Historical Risk Decay

Risk scores are not stationary. PRISME implements a temporal decay function:

```
For each corridor:
    If corridor has new risk data:
        risk = max(historical_risk × 0.95, new_risk)
    Else:
        risk = historical_risk × 0.95  ← Gradual de-escalation
```

This prevents stale threat data from permanently contaminating the routing calculations. If a crisis de-escalates and no new threatening intelligence arrives, the corridor's risk score naturally decays back toward baseline over time.

---

## Core Features

### The Backend ("Brain")

- **Graph Theory Routing Engine:** A complete `NetworkX`-based global maritime network with 66+ vertices and 76 edges, dynamically inflated by live geopolitical risk multipliers
- **Dual-Mode NLP Intelligence Engine:** Gemini 1.5 Flash for live LLM-powered threat extraction, with automatic fallback to a deterministic 72-keyword parser for 100% uptime
- **Fully Asynchronous Architecture:** Built on `FastAPI` with `asyncio` and `uvicorn`, communicating exclusively via persistent low-latency WebSockets
- **55-Headline Simulation Engine:** A curated pool of realistic crisis scenarios cycling through Hormuz closures, Houthi strikes, Russian embargoes, and multi-corridor doomsday events
- **5 Pre-Built Crisis Scenarios:** Hormuz Full Closure, Red Sea Houthi Escalation, Simultaneous Dual Blockade, Russian Oil Embargo, and Iran Maximum Pressure Sanctions

### The Frontend ("Beauty")

- **Tactical Brutalist Aesthetic:** Custom CSS glassmorphism panels with dark nautical slate backgrounds, JetBrains Mono typography, and military-grade UI contrast ratios
- **Live Interactive Cartography:** Full `react-leaflet` integration rendering India's coastline with state boundaries, 15 refinery nodes, 25 origin ports, 6 chokepoints, 4 SPR caverns, and animated polyline routes
- **Progressive Disclosure Architecture:** Five expandable modal panels (Corridor Risk Matrix, Strategic Reserve Analysis, Intelligence Feed, Routing Operations, Cost Analysis) powered by `framer-motion` animated overlays
- **Real-Time Data Visualisation:** `Recharts`-powered bar charts and area charts for cost comparison and SPR timeline projection
- **SIM / LIVE Mode Toggle:** One-click switch between offline simulation (safe demo) and live RSS-powered intelligence mode

---

## The Global Maritime Network

PRISME models the following real-world infrastructure:

### 15 Indian Refineries

| Refinery | Operator | Capacity (BPD) |
|---|---|---|
| Jamnagar | Reliance Industries | 1,240,000 |
| Jamnagar SEZ | Reliance Industries | 580,000 |
| Vadinar | Nayara Energy | 400,000 |
| Kochi | BPCL | 310,000 |
| Paradip | IOCL | 300,000 |
| Mumbai | BPCL | 300,000 |
| Panipat | IOCL | 300,000 |
| Mangalore | MRPL | 300,000 |
| Chennai | CPCL | 210,000 |
| Bathinda | HPCL-Mittal | 180,000 |
| Vizag | HPCL | 166,000 |
| Haldia | IOCL | 160,000 |
| Mathura | IOCL | 160,000 |
| Bina | BPCL | 156,000 |
| Numaligarh | NRL | 60,000 |

### 25 Global Origin Ports (Across 9 Corridors)

| Corridor | Ports | Countries |
|---|---|---|
| Hormuz | Ras Tanura, Basra, Fujairah, Kharg Island, Al Ahmadi, Sohar | Saudi Arabia, Iraq, UAE, Iran, Kuwait, Oman |
| Red Sea | Yanbu, Jeddah | Saudi Arabia |
| Suez | Novorossiysk, Primorsk, Ust-Luga, Murmansk, Ceyhan | Russia, Turkey |
| West Africa | Bonny, Escravos, Luanda, Tema | Nigeria, Angola, Ghana |
| US Gulf | LOOP Terminal, Houston, Guaymas | USA, Mexico |
| Americas | Puerto La Cruz, Jose Terminal, Angra dos Reis | Venezuela, Brazil |
| Pacific | Kozmino | Russia |
| Cape | Saldanha Bay | South Africa |

### 4 Strategic Petroleum Reserve Caverns

| Location | Capacity | Status |
|---|---|---|
| Padur | 2.50M tonnes | Operational |
| Mangalore | 1.50M tonnes | Operational |
| Visakhapatnam | 1.33M tonnes | Operational |
| Chandikhol | 4.00M tonnes | Under Construction |

### 6 Maritime Chokepoints

| Chokepoint | Global Flow (BPD) |
|---|---|
| Strait of Hormuz | 21,000,000 |
| Strait of Malacca | 16,000,000 |
| Bab el-Mandeb | 6,200,000 |
| Suez Canal | 5,500,000 |
| Mozambique Channel | Overflow |
| Cape of Good Hope | Overflow |

---

## 5 Pre-Built Crisis Scenarios

PRISME ships with curated doomsday scenarios for stress-testing:

| Scenario | Description | Duration | Price Spike |
|---|---|---|---|
| Hormuz Full Closure | Iran deploys naval mines. 21M BPD halted. Lloyd's suspends all transit insurance. | 30 days | +45% |
| Red Sea Houthi Escalation | Coordinated anti-ship missile strikes on commercial tankers at Bab el-Mandeb. | 60 days | +25% |
| Simultaneous Dual Blockade | Iran closes Hormuz while Houthis blockade Red Sea and Suez simultaneously. India loses 65% of crude corridors. | 90 days | +120% |
| Russian Oil Embargo | G7 imposes complete maritime insurance ban on Russian crude. India's 40% Russian import share halted overnight. | 180 days | +35% |
| Iran Maximum Pressure | US reimplements secondary sanctions on Indian refiners processing Iranian oil. Kharg Island drops to zero. | 365 days | +15% |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                      │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│   │ Corridor │  │ Reserve  │  │ Routing  │  │   Cost   │      │
│   │  Risk    │  │ Drawdown │  │   Ops    │  │ Analysis │      │
│   │ Matrix   │  │   SPR    │  │  Table   │  │  Chart   │      │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│   ┌──────────────────────────────────────────────────────┐     │
│   │        React-Leaflet Interactive Cartography          │     │
│   │   15 Refineries · 25 Ports · 6 Chokepoints · 4 SPR  │     │
│   │   3 Animated Polyline Routes · India State Borders   │     │
│   └──────────────────────────────────────────────────────┘     │
│                           │                                     │
│                    WebSocket (wss://)                           │
│                           │                                     │
├───────────────────────────┼─────────────────────────────────────┤
│                        BACKEND (FastAPI)                        │
│                           │                                     │
│              ┌────────────┼────────────┐                       │
│              │                         │                        │
│    ┌─────────▼──────────┐  ┌──────────▼──────────┐            │
│    │  INGESTION LAYER   │  │   PHYSICS ENGINE     │            │
│    │  (feed.py)         │  │   (engines.py)       │            │
│    │                    │  │                      │            │
│    │  • Live RSS feeds  │  │  • NetworkX Graph    │            │
│    │  • Demo headlines  │  │  • Dijkstra routing  │            │
│    │  • Crisis fallback │  │  • SPR drawdown      │            │
│    └────────┬───────────┘  └──────────▲──────────┘            │
│             │                         │                        │
│    ┌────────▼───────────┐             │                        │
│    │    NLP LAYER       │─────────────┘                        │
│    │   (extractor.py)   │                                      │
│    │                    │                                      │
│    │  • Gemini LLM      │                                      │
│    │  • Keyword parser  │                                      │
│    │  • Report gen      │                                      │
│    └────────────────────┘                                      │
│                                                                 │
│    ┌────────────────────────────────────────┐                  │
│    │          DATA LAYER                    │                  │
│    │  india_energy_grid.json (13KB)         │                  │
│    │  demo_headlines.json (12KB, 55 items)  │                  │
│    │  crisis_scenarios.json (5 scenarios)   │                  │
│    └────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 (Vite) |
| Styling | Vanilla CSS + Tailwind CSS (Glassmorphism, JetBrains Mono) |
| Interactive Mapping | React-Leaflet (Leaflet.js) |
| Data Visualisation | Recharts (BarChart, AreaChart) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend Framework | FastAPI (Python) + Uvicorn |
| Graph Mathematics | NetworkX (Dijkstra's Algorithm) |
| AI / NLP | Google Gemini 1.5 Flash (Generative AI) |
| Real-Time Communication | WebSockets (asyncio) |
| Live Intelligence Feeds | Google News RSS (XML parsing) |
| Deployment (Frontend) | Vercel |
| Deployment (Backend) | Render.com |

---

## Resilience Architecture

PRISME is engineered so that **no single component failure can stop the routing engine**.

### NLP Layer Resilience

```
Live Mode:
  1. Attempt Gemini LLM extraction  ──→ Success? Use LLM scores
  2. LLM fails (429/quota/timeout)  ──→ Fall back to keyword parser
  3. Keyword parser fails            ──→ Use hardcoded safe defaults
                                          {hormuz: 0.5, redsea: 0.2}
```

### Intelligence Feed Resilience

```
Live Mode:
  1. Fetch Google News RSS feeds     ──→ Success? Parse headlines
  2. RSS fetch fails (timeout/block) ──→ Load crisis scenario fallback
  3. Scenario load fails             ──→ Use hardcoded emergency headline
```

### WebSocket Resilience

```
Frontend:
  1. WebSocket connection drops      ──→ Auto-reconnect after 3 seconds
  2. Backend sends stale data        ──→ SHA-256 hash comparison rejects duplicates
  3. Invalid JSON received           ──→ Silent catch, no crash
```

### Graph Engine Resilience

```
Backend:
  1. Route computation fails         ──→ Return fallback route (Jamnagar direct)
  2. SPR drawdown fails              ──→ Return stable defaults (9.5 days)
  3. Report generation fails         ──→ Fall back to template-based report
```

---

## SIM Mode vs LIVE Mode

PRISME supports two operational modes, toggled with a single button:

### SIM Mode (Simulation)

For safe demonstrations and stress-testing:

- Cycles through **55 pre-built crisis headlines** offline
- Headlines rotate every **6 seconds**
- No external API calls required
- Threat extraction uses the deterministic **keyword parser**
- Reports generated from local templates
- Sequence ticker displays `SEQ: 01/55` progress

### LIVE Mode

For real-world operational monitoring:

- Ingests **real-time RSS feeds** from Google News
- Searches for maritime and energy-related geopolitical events
- Threat extraction uses **Gemini 1.5 Flash LLM** (with keyword parser fallback)
- Situation reports generated by the LLM in natural language
- Data updates continuously as new headlines arrive

---

## The Interface

PRISME's interface is built around five expandable intelligence panels arranged around a central interactive map:

### Left Sidebar (Top to Bottom)

1. **Corridor Risk Matrix** — Real-time threat levels (0-100%) across 9 global maritime corridors. Expandable to view per-corridor intelligence items with sentiment colour-coding.

2. **Strategic Reserve Capacity** — India's SPR remaining coverage in days, drawdown status, GDP penalty. Expandable to view the full calculation breakdown: drawdown period, deficit barrels, national consumption rate, and the exact reasoning chain explaining why the current assessment was reached.

3. **Intelligence Feed** — Raw geopolitical headlines colour-coded by sentiment: Red (negative/threat), Green (positive/de-escalation), Yellow (neutral). Expandable to view the full log with severity tags.

### Bottom Centre

4. **Strategic Routing Operations** — The top 5 ranked routes with origin, destination, transit days, risk score, and distance. Displays the live typewriter-animated intelligence report. Shows the routing formula. Expandable to view detailed justification for the top 3 routes (Optimal, Primary Alternative, Secondary Alternative) with "Why this route?" explanations.

### Bottom Right

5. **Cost Analysis** — Bar chart comparing risk-weighted penalty scores across origin ports. Expandable to view the full formula explanation and enlarged visualisation.

### Map Elements

- **Animated Polyline Routes** — Top 3 routes rendered as dashed animated lines (Gold = Optimal, Cyan = Alternative 1, Pink = Alternative 2)
- **Refinery Nodes** — Blue circles sized by capacity (BPD)
- **SPR Caverns** — Purple circles
- **Origin Ports** — White/grey circles
- **Chokepoints** — Gold circles with tooltips
- **India State Boundaries** — Dashed internal borders
- **Map Legend** — Persistent legend panel in the top right

### Header Bar

- **PRISME Logo & Title** — Left-aligned with IEC-OPCEN operations center identifier
- **Network Topology Badge** — Displays `NET: 15R 25P 6C 76E` (Refineries, Ports, Chokepoints, Edges)
- **Sequence Ticker** — Shows `SEQ: 01/55` headline cycling progress in SIM mode
- **SIM / LIVE Toggle** — One-click mode switch
- **Connection Status** — `SYS_ONLINE` (gold LED) or `SYS_ERROR` (red pulsing LED)

---

## Demo Flow

PRISME is best demonstrated through **live crisis simulation**, not static screenshots.

### Demo 1 — Hormuz Closure

The system starts in SIM mode. Headlines about Iranian naval mine deployment begin cycling.

PRISME:

→ parses the headline with the keyword engine
→ assigns Hormuz corridor risk to 0.95
→ inflates all Hormuz-dependent edges by 10x
→ Dijkstra rejects the Persian Gulf corridor
→ discovers an alternative route via West Africa or the Americas
→ calculates the new transit time (e.g., 14+ days vs. 4 days standard)
→ computes SPR drawdown and displays remaining coverage dropping
→ forecasts multi-billion dollar GDP penalty

### Demo 2 — Dual Blockade (Doomsday)

Simultaneous Hormuz + Red Sea + Suez closure.

PRISME:

→ all three primary corridors spike to 95%+ risk
→ algorithm forces procurement shift to West Africa, US Gulf, or Pacific
→ transit times increase dramatically
→ SPR coverage drops to critical levels
→ GDP penalty shows catastrophic economic impact

### Demo 3 — Live Mode

Switch from SIM to LIVE. Real Google News headlines appear.

PRISME:

→ fetches actual RSS feeds about oil, shipping, and geopolitics
→ Gemini LLM extracts real-time risk scores from actual news
→ routing engine recalculates based on the real-world threat landscape
→ operator sees the actual current state of global maritime risk

---

## Why Not Just an AI Wrapper?

PRISME is fundamentally **not** a wrapper around an LLM.

| AI Wrapper Approach | PRISME's Engineering |
|---|---|
| Send user query to ChatGPT | Build a 66-vertex, 76-edge weighted graph in NetworkX |
| Display the AI's text response | Execute Dijkstra's algorithm across all origin-refinery permutations |
| Hope the AI doesn't hallucinate routes | Compute mathematically provable optimal paths |
| No fallback if AI is down | Deterministic keyword parser ensures 100% uptime |
| Static output | Real-time WebSocket streaming with live map updates |
| No economic modelling | SPR drawdown simulation with calibrated GDP impact forecasting |

The AI (Gemini) is used strictly as a **data extraction microservice**. It converts unstructured text into structured risk scores. The actual routing decisions, economic calculations, and strategic recommendations are computed by the custom-engineered graph physics engine.

If the AI goes offline entirely, PRISME continues to function at full capability using its deterministic keyword parser.

---

## Local Run Instructions

PRISME uses a split architecture: a Python backend (FastAPI) and a React frontend (Vite). Both must be running simultaneously.

### Prerequisites

- Node.js (v18+)
- Python (3.9+)
- A Google Gemini API Key (optional — system works without it using the keyword parser)

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd apps/api

# Create and activate a virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API Key (optional)
# Windows:
set GEMINIAPIKEY=your_api_key_here
# Mac/Linux:
export GEMINIAPIKEY=your_api_key_here

# Start the server
python -m uvicorn main:app --port 8000 --reload
```

The backend will now be running on `ws://localhost:8000/ws`

### 2. Frontend Setup (React/Vite)

Open a new terminal:

```bash
# Navigate to the frontend directory
cd apps/web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will now be running on `http://localhost:5173`

---

## Deployment Architecture

- **Frontend:** Vercel — `https://prisme-puce-nu.vercel.app`
- **Backend:** Render.com — `wss://prisme-backend-mduw.onrender.com/ws`

> [!IMPORTANT]
> **Live Feed Connectivity:** The intelligence map uses WebSockets (`wss://`) for real-time updates. If your browser's adblocker or strict privacy extensions block the connection (`SYS_ERROR`), please view the deployment in an **Incognito / Private window** with extensions disabled.

### The 14-Minute Ping Strategy

Because hackathon judges evaluate projects asynchronously, we address Render.com's free-tier server sleep problem:

- **The Problem:** Render's free tier suspends web services after 15 minutes of inactivity. A sleeping backend means the WebSocket connection times out when a judge visits.
- **The Solution:** [cron-job.org](https://cron-job.org) sends a lightweight HTTP GET request to the backend every **14 minutes**, keeping it active 24/7 without incurring charges. This guarantees an instant, seamless experience for judges regardless of when they review the submission.

---

## Project Structure

```
prisme/
├── apps/
│   ├── api/                     # FastAPI backend server
│   │   ├── main.py              # WebSocket endpoint, mode handling, orchestration
│   │   └── requirements.txt     # Python dependencies
│   └── web/                     # React frontend application
│       └── src/
│           ├── App.jsx          # Full application (map, panels, modals, state)
│           ├── index.css        # Glassmorphism design system
│           └── App.css          # Component-level styles
├── packages/
│   ├── physics/
│   │   └── engines.py           # NetworkX graph builder, Dijkstra routing, SPR drawdown
│   ├── nlp/
│   │   └── extractor.py         # Gemini LLM extraction, keyword parser, report generation
│   └── ingestion/
│       └── feed.py              # RSS fetching, demo headline cycling, crisis scenario loading
├── data/
│   ├── india_energy_grid.json   # 15 refineries, 25 ports, 6 chokepoints, 4 SPR, 76 edges
│   ├── demo_headlines.json      # 55 curated crisis simulation headlines
│   └── crisis_scenarios.json    # 5 pre-built doomsday scenarios with corridor risk profiles
└── README.md
```

---

## Future Scope

PRISME can evolve toward:

- Multi-commodity support beyond crude oil (LNG, coal, fertiliser)
- Integration with real-time AIS (Automatic Identification System) vessel tracking data
- Machine learning-based risk prediction (temporal patterns, seasonal adjustments)
- Multi-objective optimisation (cost vs. time vs. risk Pareto frontiers)
- Insurance premium forecasting based on corridor risk levels
- Integration with official ISPRL (Indian Strategic Petroleum Reserves Limited) data feeds
- Fleet management and vessel assignment optimisation
- Historical crisis replay and training mode
- Mobile-responsive tactical interface for field commanders

The architecture is intentionally designed so additional corridors, ports, refineries, and data sources can be added by simply extending the JSON grid file without modifying any code.

---

## Disclaimer

PRISME is a hackathon prototype built for academic and demonstration purposes.

It uses publicly available geographic data, estimated nautical distances, and simulated or publicly available news feeds. The Strategic Petroleum Reserve figures and GDP impact estimates are based on published government data and standard economic models, but should not be treated as official government intelligence.

PRISME is **not affiliated with** the Indian Ministry of Petroleum and Natural Gas, ISPRL, or any defence establishment.

---

## Team

**Team:** Art of War

---

## Links

**Live Demo:** `https://prisme-puce-nu.vercel.app`

**Demo Video:** `https://youtu.be/kuVXk4v8JLI?si=Cp5NOcoOd1-napVG`

**Repository:** `https://github.com/ayush-mg/prisme`

---

<div align="center">

## PRISME

### **Detect the threat. Compute the detour. Protect the supply.**

Built for national energy security.
Built on Graph Theory.
Built to turn geopolitical chaos into mathematical certainty.

</div>
