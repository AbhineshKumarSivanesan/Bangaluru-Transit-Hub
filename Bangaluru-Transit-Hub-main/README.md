# Bengaluru Transit Hub

An intelligent, multimodal transit routing application for Bengaluru. 

## Features
- **Live Weather Integration**: Uses Open-Meteo API to fetch Bengaluru's weather and automatically prioritizes Metro routes if heavy rain is detected.
- **Streetlight Safety Score**: Simulates Overpass API queries to calculate a safety score based on streetlight density along the transit path.
- **Interactive Routing Map**: Implements Leaflet.js to render routing paths, start/end markers, and step instructions dynamically.
- **Namma Yatri Deep Linking**: Last-mile connectivity through functional deep links for booking auto-rickshaws or cabs.

## Project Structure
- `/backend`: Node.js + Express server on port 5000.
- `/frontend`: React + Vite + Tailwind CSS + Leaflet.js.

## Getting Started

### 1. Install Dependencies
Run the following command at the root of `bengaluru-transit-hub` to install root, frontend, and backend packages:
```bash
npm run install:all
```

### 2. Run the Application
Start both the Express backend and React frontend concurrently in development mode:
```bash
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173) (or next available port) and query the backend on [http://localhost:5000](http://localhost:5000).
