import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

// Helper component to draw the actual road path using Directions API, with a fallback to Polyline
const MapDirections = ({ selectedRoute }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();
  const fallbackPolylineRef = useRef(null);

  // Initialize service and renderer once library is loaded
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // Request actual route paths when selectedRoute changes
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !selectedRoute?.path || selectedRoute.path.length < 2) {
      if (directionsRenderer) directionsRenderer.setDirections(null);
      if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
      return;
    }

    const pathCoords = selectedRoute.path.map(coord => {
      if (Array.isArray(coord)) return { lat: coord[0], lng: coord[1] };
      return coord;
    });

    const origin = pathCoords[0];
    const destination = pathCoords[pathCoords.length - 1];

    let pathColor = '#00E676'; // Electric Green (Metro)
    if (selectedRoute.type === 'BMTC Bus') pathColor = '#3b82f6'; // Blue
    if (selectedRoute.type === 'Direct Cab') pathColor = '#f97316'; // Orange

    // We suppress markers because we already draw custom AdvancedMarkers for start/end
    directionsRenderer.setOptions({
      suppressMarkers: true,
      preserveViewport: false, 
      polylineOptions: {
        strokeColor: pathColor,
        strokeWeight: 5,
        strokeOpacity: 0.85
      }
    });

    // Helper to draw a fallback straight line
    const drawFallbackLine = () => {
      console.warn("Falling back to straight Polyline due to Directions API failure.");
      if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
      
      const isDashed = selectedRoute.type === 'Metro + Walk';
      const lineSymbol = { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 };

      fallbackPolylineRef.current = new window.google.maps.Polyline({
        path: [origin, destination],
        geodesic: true,
        strokeColor: pathColor,
        strokeOpacity: isDashed ? 0 : 0.85,
        strokeWeight: 5,
        icons: isDashed ? [{ icon: lineSymbol, offset: '0', repeat: '20px' }] : [],
      });
      fallbackPolylineRef.current.setMap(map);

      // Auto-fit bounds for the fallback line
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    };

    let travelMode = window.google.maps.TravelMode.DRIVING;
    if (selectedRoute.type === 'Metro + Walk') travelMode = window.google.maps.TravelMode.TRANSIT;

    directionsService.route({
      origin,
      destination,
      travelMode: travelMode
    }).then(response => {
      if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
      directionsRenderer.setDirections(response);
    }).catch(error => {
      console.error("Failed to fetch directions:", error);
      // Fallback to drawing a straight line if API is denied
      drawFallbackLine();
    });

    return () => {
      directionsRenderer.setDirections(null);
      if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
    };
  }, [directionsService, directionsRenderer, selectedRoute, map]);

  return null;
};

export default function RouteMap({ selectedRoute, start, destination }) {
  // Centered on Bengaluru Center
  const bLrCenter = { lat: 12.9716, lng: 77.5946 };
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  // Format coordinates for markers
  const startPoint = selectedRoute?.path?.[0];
  const destPoint = selectedRoute?.path?.[selectedRoute.path.length - 1];

  const formatCoord = (coord) => {
    if (Array.isArray(coord)) return { lat: coord[0], lng: coord[1] };
    return coord;
  };

  const startCoord = startPoint ? formatCoord(startPoint) : null;
  const destCoord = destPoint ? formatCoord(destPoint) : null;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Map Target Div */}
      <div className="w-full h-full min-h-[400px] lg:h-full z-10">
        <APIProvider apiKey={apiKey}>
          <Map 
            defaultCenter={bLrCenter} 
            defaultZoom={12} 
            mapId="DEMO_MAP_ID" // Requires a Map ID for AdvancedMarker
            disableDefaultUI={true}
            zoomControl={true}
            gestureHandling="greedy"
          >
            <MapDirections selectedRoute={selectedRoute} />
            
            {startCoord && (
              <AdvancedMarker position={startCoord} title={`Start: ${start}`}>
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <div className="absolute w-5 h-5 bg-electric-green rounded-full opacity-65 animate-ping"></div>
                  <div className="w-3.5 h-3.5 bg-electric-green border border-white rounded-full shadow-glow"></div>
                </div>
              </AdvancedMarker>
            )}
            
            {destCoord && (
              <AdvancedMarker position={destCoord} title={`Destination: ${destination}`}>
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <div className="absolute w-5 h-5 bg-orange-500 rounded-full opacity-65 animate-ping"></div>
                  <div className="w-3.5 h-3.5 bg-orange-500 border border-white rounded-full shadow-lg"></div>
                </div>
              </AdvancedMarker>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Map overlay helper legend */}
      {selectedRoute && (
        <div className="absolute bottom-4 right-4 z-20 glass-panel px-3 py-2 rounded-lg text-xs border border-white/10 flex flex-col gap-1.5 shadow">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-electric-green border-t border-dashed"></div>
            <span>Selected Path: {selectedRoute.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-electric-green"></span>
            <span>Origin: {start}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>Destination: {destination}</span>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {!selectedRoute && (
        <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <Icons.Map className="h-12 w-12 text-navy-300 mb-3 animate-pulse" />
          <h3 className="text-base font-bold">Interactive Route Viewer</h3>
          <p className="text-xs text-navy-300 max-w-xs mt-1.5 leading-relaxed">
            Select an origin and destination, then hit "Find Safe Route" to overlay details onto the live map.
          </p>
        </div>
      )}
    </div>
  );
}

// Re-map Map icon helper to avoid layout error imports
const Icons = {
  Map: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
};
