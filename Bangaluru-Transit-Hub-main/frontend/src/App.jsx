import React, { useState, useEffect } from 'react';
import WeatherBanner from './components/WeatherBanner';
import SearchPanel from './components/SearchPanel';
import RouteCard from './components/RouteCard';
import RouteMap from './components/RouteMap';
import { Compass, Info, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

const FALLBACK_LOCATIONS = [
  'Indiranagar',
  'Koramangala',
  'Whitefield',
  'Majestic',
  'Jayanagar',
  'Electronic City',
  'MG Road'
];

export default function App() {
  const [locations, setLocations] = useState(FALLBACK_LOCATIONS);
  const [start, setStart] = useState('Indiranagar');
  const [destination, setDestination] = useState('Koramangala');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [mockRain, setMockRain] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch locations and weather on mount
  useEffect(() => {
    fetchLocations();
    fetchWeather();
  }, [mockRain]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (err) {
      console.warn('Failed to fetch locations from API, using defaults:', err);
    }
  };

  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`/api/weather?mockRain=${mockRain}`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      } else {
        throw new Error('Weather API returned error status');
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      // Hard fallback if backend is not started yet or failing
      setWeather({
        rainProbability: mockRain ? 85 : 10,
        status: mockRain ? 'Heavy Rain Warning' : 'Clear Skies'
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!start || !destination) return;

    setRoutesLoading(true);
    setError(null);
    setSelectedRoute(null);

    try {
      const response = await fetch(`/api/routes?mockRain=${mockRain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ start, destination })
      });

      if (!response.ok) {
        throw new Error('Failed to find routing options.');
      }

      const data = await response.json();
      setRoutes(data);
      
      // Auto-select the first route (usually the Recommended/Metro one)
      if (data && data.length > 0) {
        setSelectedRoute(data[0]);
      }
    } catch (err) {
      console.error('Routing request failed:', err);
      setError('Could not connect to routing server. Please check that the backend is running.');
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleToggleMockRain = () => {
    setMockRain(prev => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy-950 text-white">
      {/* Top Banner Alert */}
      <WeatherBanner 
        weather={weather} 
        loading={weatherLoading} 
        onToggleMockRain={handleToggleMockRain}
        mockRain={mockRain}
      />

      {/* Main Header */}
      <header className="border-b border-white/5 bg-navy-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-electric-green to-teal-400 flex items-center justify-center shadow-glow">
              <Compass className="h-6 w-6 text-navy-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-electric-green bg-clip-text text-transparent">
                Bengaluru Transit Hub
              </h1>
              <p className="text-xs text-navy-300 font-medium">Multimodal Safety Engine</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-navy-300 bg-navy-900 border border-navy-800 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-4 w-4 text-electric-green" />
            Streetlight density safety index integrated
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Sidebar Inputs & Results */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6 flex-shrink-0">
          
          {/* Input Form */}
          <SearchPanel 
            locations={locations}
            start={start}
            setStart={setStart}
            destination={destination}
            setDestination={setDestination}
            onSubmit={handleSearch}
            loading={routesLoading}
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-200 flex items-start gap-2.5 text-sm">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Route Results Column */}
          {routes.length > 0 && !routesLoading && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-300">
                  Available Safe Routes
                </h3>
                <span className="text-xs text-electric-green flex items-center gap-1 font-semibold">
                  Sorted by safety & weather priority
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isSelected={selectedRoute?.id === route.id}
                    onSelect={() => setSelectedRoute(route)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Loading Skeletal state */}
          {routesLoading && (
            <div className="flex flex-col gap-4">
              <div className="h-4 bg-navy-900 border border-white/5 rounded w-1/2 animate-pulse"></div>
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 bg-navy-900/50 border border-white/5 rounded-xl h-44 animate-pulse flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-navy-800 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-navy-800 rounded w-1/3"></div>
                      <div className="h-3 bg-navy-800 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-navy-800 rounded w-full"></div>
                  <div className="h-3 bg-navy-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state when routes haven't been searched yet */}
          {routes.length === 0 && !routesLoading && (
            <div className="glass-panel p-6 rounded-xl border border-white/10 text-center flex flex-col items-center justify-center py-10">
              <MapPin className="h-10 w-10 text-navy-300 mb-2.5 animate-bounce" />
              <h4 className="font-bold text-sm">Where are you traveling?</h4>
              <p className="text-xs text-navy-300 max-w-xs mt-1.5 leading-relaxed">
                Choose locations above and hit search. The engine analyzes streetlight density via Overpass API and weather forecasts via Open-Meteo to recommend the safest routes.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Maps Frame */}
        <div className="flex-1 h-[450px] lg:h-auto min-h-[450px] relative">
          <RouteMap 
            selectedRoute={selectedRoute}
            start={start}
            destination={destination}
          />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-white/5 bg-navy-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-300 gap-2">
          <div className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-electric-green" />
            <span>Multimodal Transit Engine prototype using OpenStreetMap data and Open-Meteo API.</span>
          </div>
          <div>
            &copy; 2026 Bengaluru Transit Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
