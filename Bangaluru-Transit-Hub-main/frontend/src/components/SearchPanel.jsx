import React from 'react';
import { MapPin, Navigation, ArrowUpDown, Shield } from 'lucide-react';

export default function SearchPanel({ 
  locations, 
  start, 
  setStart, 
  destination, 
  setDestination, 
  onSubmit, 
  loading 
}) {
  
  const handleSwap = () => {
    const temp = start;
    setStart(destination);
    setDestination(temp);
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-white/10 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-electric-green/10 text-electric-green">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Transit Router</h2>
          <p className="text-xs text-navy-300">Intelligent safety-first transit planner</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
            Starting Location
          </label>
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 text-electric-green h-4 w-4 pointer-events-none" />
            <select
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full bg-navy-950/80 border border-navy-700/60 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-electric-green focus:ring-1 focus:ring-electric-green/20 text-white appearance-none cursor-pointer"
            >
              <option value="" disabled>Select origin...</option>
              {locations.map((loc) => (
                <option key={`start-${loc}`} value={loc} disabled={loc === destination}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center -my-2.5">
          <button
            type="button"
            onClick={handleSwap}
            className="p-1.5 rounded-full bg-navy-800 hover:bg-navy-700 border border-navy-700 hover:border-electric-green/40 text-navy-300 hover:text-electric-green transition-all shadow"
            title="Swap Locations"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
            Destination
          </label>
          <div className="relative flex items-center">
            <Navigation className="absolute left-3 text-orange-400 h-4 w-4 pointer-events-none" />
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-navy-950/80 border border-navy-700/60 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-electric-green focus:ring-1 focus:ring-electric-green/20 text-white appearance-none cursor-pointer"
            >
              <option value="" disabled>Select destination...</option>
              {locations.map((loc) => (
                <option key={`dest-${loc}`} value={loc} disabled={loc === start}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !start || !destination}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-glow ${
            loading || !start || !destination
              ? 'bg-navy-800 text-navy-500 cursor-not-allowed border border-navy-700/30 shadow-none'
              : 'bg-electric-green text-navy-950 hover:bg-white hover:text-navy-950 border border-electric-green'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-navy-950 border-r-transparent"></div>
              <span>Analyzing Routes...</span>
            </>
          ) : (
            <span>Find Safe Route</span>
          )}
        </button>
      </form>
    </div>
  );
}
