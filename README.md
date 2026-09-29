# BHAVANINFO (ਭਵਨ-ਇੰਫੋ)
### BHAVANINFO • 3D Cadastral Digital Twin & Land Modernization Portal
**Ministry of Rural Development & Panchayati Raj • Government of India • DILRMP / SVAMITVA 2.0**

---

## 🏛️ Executive Summary
**BHAVANINFO** is an enterprise-grade 3D Cadastral Digital Twin and Land Administration portal built in compliance with **ISO 19152 (Land Administration Domain Model - LADM 3D)**. It unifies high-resolution satellite remote sensing, autonomous drone LiDAR/SLAM 3R telemetry, and ground-penetrating radar (GPR) into an interactive geospatial platform for citizens, tehsildars, and municipal authorities.

---

## 🚀 Key Features

### 1. 🌆 Real 3D Satellite City Cadastre (MapLibre GL JS)
- Over **125,000+ real 3D building twins** across the State of Punjab:
  - Amritsar Core Heritage Ward (1,500 3D twins)
  - Amritsar Entire City (22,300+ ML building footprints)
  - Jalandhar Division (42,800+ buildings)
  - Ludhiana Industrial Division (61,900+ buildings)
- Interactive base layer toggle: High-Res ESRI World Satellite Imagery, Street Map, and Topographic Relief.
- Gold hovering HUD displaying 14-digit Bhu-Aadhaar ULPIN, survey/khasra numbers, detected floor heights, and statutory compliance status.

### 2. 🏢 3D Digital Twin Inspector & Subterranean Utilities (Three.js WebGL)
- High-fidelity Level-by-Level vertical airspace and subterranean inspection:
  - **Subterranean Foundation (-30 ft / -9.14m):** Walkable multi-utility gallery with 11kV/33kV electrical transmission feeders, 450mm ductile iron potable water mains with isolation valves, piped natural gas (PNG) steel mains, and BharatNet 96-core optical fiber lines.
  - **Connected Infrastructure:** Visible conduits and pipes entering directly into the building's foundation and vertical risers, complete with continuous flow and energy pulsation animations.
  - **Deep Engineering Foundations:** Cast-in-situ concrete bored piles and exposed high-tensile steel rebar cages socketed into -12m bedrock with tie grade beams.
  - **Building Levels:** Ground floor lobby/stilt, first floor, and upper floors with real architectural BIM dimensions.

### 3. ✏️ Interactive Cadastral Map Drawing & Land Registration
- Citizen and officer registration modal:
  - **`[📍 Select Building on Map]`**: Snap directly to any existing building on the 3D map.
  - **`[✏️ Draw Boundary Polygon]`**: Interactively drop boundary corner markers directly on the map.
  - **Real-Time Geodesic Area Calculation:** Live spherical Shoelace formula computing land area in **sq. yards**, **sq. feet**, and **sq. meters** alongside GPS centroid.
  - **Extrusion on Map:** Submitting registration saves coordinates into SQLite (`cadastre.db`), creates Sub-ULPINs, issues an official Bharatkosh Challan receipt, displays a 2-working-days drone survey notification, and immediately extrudes the new building on the 3D map.

### 4. 🧠 Bhu-Samvaad AI: Real Multi-Modal Deep Learning & Hybrid RAG Engine
- **Custom Model (`ml/model.py`):** `BhuCadastreTransformer`, a real multi-modal PyTorch Transformer encoding spatial footprint coordinates via Fourier positional embeddings + legal deeds via self-attention and cross-modal fusion.
- **Pre-Training Pipeline (`ml/pretrain.py`):** Ready-to-train self-supervised pipeline using Masked Language Modeling (MLM) and Contrastive Spatial-Legal Alignment loss.
- **Fine-Tuning Pipeline (`ml/train.py`):** Downstream multi-task heads for statutory violation detection (e.g. unauthorized 3rd floor extensions) and property tax valuation in INR.
- **Hybrid RAG Pipeline (`ml/rag_engine.py`):** Combines BM25 sparse keyword matching and dense semantic vector embeddings over:
  - *The Punjab Land Revenue Act, 1887* (Jamabandi, Record-of-Rights, Mutations under Sec 34).
  - *The Punjab Municipal Corporation Act, 1976* (Section 187 Demolition / Compounding 24h Notices).
  - *SVAMITVA 2.0 Operational Guidelines* (Drone LiDAR SLAM, CORS network, Property Cards).
  - *Amritsar Municipal Corporation Building Bye-Laws 2026* (Heritage Zone FAR: 1.75, Height ceiling: 11m).
  - *Live Cadastre Database (`cadastre.db`)*.

---

## 📁 Repository Directory Structure

```
d:/BHAVANINFO/
├── index.html                 # Main Portal Interface (Government of India Theme)
├── server.js                  # Native Node.js HTTP & SQLite API Backend
├── cadastre.db                # SQLite Database (Parcels, Sub-ULPINs, Mutations, Drone Missions)
│
├── src/                       # Frontend Architecture
│   ├── app.js                 # Main Application Controller & State Management
│   ├── map2d.js               # MapLibre GL 3D City Engine & Drawing Controller
│   ├── twin3d.js              # Three.js 3D Digital Twin & Subterranean Engine
│   ├── styles/
│   │   └── gov-theme.css      # Official NIC/Digital India Design System
│   ├── data/
│   │   └── punjab_parcels.js  # Cadastral Parcel Datasets & Seed Records
│   └── utils/
│       └── texture_gen.js     # Procedural Textures (Façade, Soil Strata, Rooftops)
│
├── ml/                        # Machine Learning & AI Engineering
│   ├── model.py               # Real PyTorch Multi-Modal BhuCadastreTransformer
│   ├── dataset.py             # Cadastral Multi-Modal Dataset Generator & Tokenizer
│   ├── pretrain.py            # Self-Supervised Pre-Training Script (MLM + InfoNCE)
│   ├── train.py               # Downstream Fine-Tuning Script (Violation & Valuation)
│   ├── rag_engine.py          # Hybrid RAG Engine (BM25 + Semantic Vector Retrieval)
│   └── checkpoints/           # Saved PyTorch Checkpoints (*.pt)
│
├── data/                      # Organized Datasets & Spatial Layers
│   ├── geojsons/              # Cadastral GeoJSON Layers & Building Footprints
│   ├── government_records/    # Government Revenue CSVs, Census, and Excel Records
│   └── raw_kml_kmz/           # Large Drone & Satellite KML / KMZ Datasets
│
├── vendor/                    # Local Dependencies
│   ├── maplibre-gl.js         # MapLibre GL JS
│   ├── maplibre-gl.css        # MapLibre GL Stylesheet
│   ├── three.min.js           # Three.js WebGL Library
│   └── OrbitControls.js       # Three.js Camera Orbit Controls
│
└── docs/                      # Technical Documentation & Specifications
```

---

## 🛠️ Quick Start Guide

### 1. Launch Portal Backend Server
```bash
node server.js
```
Open **`http://localhost:3000`** in any modern web browser.

### 2. Pre-Train Custom Multi-Modal Cadastre Model
```bash
python ml/pretrain.py --epochs 3 --batch_size 16
```

### 3. Fine-Tune on Anomaly Detection & Land Valuation
```bash
python ml/train.py --epochs 3 --batch_size 16
```

### 4. Query the Bhu-Samvaad Cadastral RAG Engine
```bash
python ml/rag_engine.py --query "What is the statutory notice period for unauthorized Level 3 construction under Section 187?"
```
