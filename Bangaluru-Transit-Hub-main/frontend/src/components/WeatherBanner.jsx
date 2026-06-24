import React from 'react';
import { CloudRain, Sun, AlertTriangle } from 'lucide-react';

export default function WeatherBanner({ weather, loading, onToggleMockRain, mockRain }) {
  if (loading) {
    return (
      <div className="w-full bg-navy-900 border-b border-navy-800 py-3 px-4 flex items-center justify-between text-xs text-navy-300">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-electric-green border-r-2 border-transparent"></div>
          Checking live Bengaluru weather forecast...
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const isRainWarning = weather.rainProbability > 70;

  return (
    <div className={`w-full border-b transition-all duration-300 ${
      isRainWarning 
        ? 'bg-gradient-to-r from-red-950/40 via-orange-950/30 to-navy-950 border-orange-500/40 text-orange-200' 
        : 'bg-navy-900/80 border-navy-800 text-navy-300'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          {isRainWarning ? (
            <AlertTriangle className="h-5 w-5 text-orange-400 animate-pulse flex-shrink-0" />
          ) : weather.rainProbability > 30 ? (
            <CloudRain className="h-5 w-5 text-blue-400 flex-shrink-0" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400 flex-shrink-0" />
          )}
          
          <span>
            {isRainWarning ? (
              <strong>🚨 Heavy Rain Warning: </strong>
            ) : null}
            {isRainWarning 
              ? "Heavy rain expected in Bengaluru. Metro routes are currently prioritized to avoid waterlogged streets and severe gridlock."
              : `Bengaluru Weather: ${weather.status} (${weather.rainProbability}% precipitation probability). Operations running normally.`
            }
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-navy-300 bg-navy-800/80 border border-navy-700/50 px-2 py-0.5 rounded">
            Rain: {weather.rainProbability}%
          </span>
          <button 
            onClick={onToggleMockRain}
            className={`text-xs px-2.5 py-1 rounded transition border ${
              mockRain 
                ? 'bg-electric-green text-navy-950 border-electric-green hover:bg-white hover:border-white' 
                : 'bg-navy-800 text-white border-navy-700 hover:border-navy-600'
            }`}
          >
            {mockRain ? "Disable Mock Rain" : "Force Rainy Mode (Test)"}
          </button>
        </div>
      </div>
    </div>
  );
}
