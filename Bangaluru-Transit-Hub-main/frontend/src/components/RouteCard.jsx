import React, { useState } from 'react';
import * as Icons from 'lucide-react';

export default function RouteCard({ route, isSelected, onSelect }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Dynamically resolve icons
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Subway':
        return <Icons.Train className="h-5 w-5 text-electric-green" />;
      case 'Bus':
        return <Icons.Bus className="h-5 w-5 text-blue-400" />;
      case 'Car':
        return <Icons.Car className="h-5 w-5 text-orange-400" />;
      default:
        return <Icons.Navigation className="h-5 w-5 text-navy-300" />;
    }
  };

  const isRecommended = route.isRecommended;

  // Determine safety bar colors
  const getSafetyColorClass = (score) => {
    if (score >= 90) return 'bg-electric-green';
    if (score >= 75) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const getSafetyBgClass = (score) => {
    if (score >= 90) return 'bg-electric-green/20';
    if (score >= 75) return 'bg-yellow-400/20';
    return 'bg-red-500/20';
  };

  const getCrowdBadgeColor = (crowd) => {
    switch (crowd?.toLowerCase()) {
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'high':
      case 'very high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-navy-700/50 text-navy-300 border-navy-600/30';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`glass-card p-4 rounded-xl cursor-pointer border transition-all duration-300 flex flex-col gap-3.5 relative overflow-hidden ${
        isSelected 
          ? 'border-electric-green bg-navy-800/80 shadow-glow' 
          : isRecommended
            ? 'border-electric-green/40 recommended-active hover:border-electric-green/80'
            : 'border-white/5 hover:border-white/20'
      }`}
    >
      {/* Recommended Tag */}
      {isRecommended && (
        <div className="absolute top-0 right-0">
          <div className="bg-electric-green text-navy-950 font-extrabold text-[10px] tracking-widest px-3 py-1 uppercase rounded-bl-lg shadow-sm flex items-center gap-1.5 animate-pulse">
            <Icons.Sparkles className="h-3 w-3" />
            Safest & Fastest
          </div>
        </div>
      )}

      {/* Main Info */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-navy-800 border border-navy-700/50 flex-shrink-0">
          {getIcon(route.icon)}
        </div>
        
        <div className="flex-1 pr-16">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            {route.type}
          </h3>
          <p className="text-xs text-navy-300 mt-0.5 leading-relaxed">
            {route.description}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 bg-navy-950/40 rounded-lg p-2 border border-navy-800/40">
        <div className="text-center border-r border-navy-800/80">
          <span className="block text-[10px] uppercase text-navy-300 font-medium">Time</span>
          <span className="text-sm font-bold text-white">{route.time}</span>
        </div>
        <div className="text-center border-r border-navy-800/80">
          <span className="block text-[10px] uppercase text-navy-300 font-medium">Cost</span>
          <span className="text-sm font-bold text-electric-green">{route.cost}</span>
        </div>
        <div className="text-center">
          <span className="block text-[10px] uppercase text-navy-300 font-medium">Crowd</span>
          <span className={`inline-block text-[11px] font-semibold px-2 py-0.2 mt-0.5 rounded-full border ${getCrowdBadgeColor(route.crowdLevel)}`}>
            {route.crowdLevel}
          </span>
        </div>
      </div>

      {/* Safety Score Meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-navy-300 flex items-center gap-1">
            <Icons.Shield className="h-3.5 w-3.5 text-electric-green" />
            Safety Rating (OSM Streetlights)
          </span>
          <span className="font-extrabold text-white">{route.safetyScore}/100</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${getSafetyBgClass(route.safetyScore)}`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getSafetyColorClass(route.safetyScore)}`} 
            style={{ width: `${route.safetyScore}%` }}
          />
        </div>
        <div className="text-[10px] text-navy-300 flex justify-between">
          <span>{route.streetlightCount} streetlights detected</span>
          <span>Density: {route.safetyDensity}/km²</span>
        </div>
      </div>

      {/* Deep Link Action */}
      {route.deepLink && (
        <div className="relative mt-1">
          <a
            href={route.deepLink}
            onClick={(e) => {
              // Prevent selecting the card from firing double click handling
              e.stopPropagation();
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-full py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-700/80 border border-navy-700 hover:border-electric-green/40 text-xs text-white font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <Icons.ExternalLink className="h-3.5 w-3.5 text-electric-green" />
            Book Namma Yatri
          </a>

          {/* Deep link tooltip */}
          {showTooltip && (
            <div className="absolute z-30 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2 bg-navy-950 border border-navy-700 rounded-lg shadow-xl text-center pointer-events-none">
              <span className="text-[11px] text-white block">
                🚀 Opens native Namma Yatri app on mobile with destination pre-filled.
              </span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-navy-950"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
