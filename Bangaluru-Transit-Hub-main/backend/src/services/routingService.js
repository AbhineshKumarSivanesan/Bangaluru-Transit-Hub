import { getBengaluruWeather } from './weatherService.js';
import { calculateSafetyScore } from './safetyService.js';

// Popular locations in Bengaluru and their coordinates
export const BENGALURU_LOCATIONS = {
  "Indiranagar": { lat: 12.9784, lng: 77.6408 },
  "Koramangala": { lat: 12.9279, lng: 77.6271 },
  "Whitefield": { lat: 12.9698, lng: 77.7500 },
  "Majestic": { lat: 12.9779, lng: 77.5729 },
  "Jayanagar": { lat: 12.9308, lng: 77.5830 },
  "Electronic City": { lat: 12.8452, lng: 77.6602 },
  "MG Road": { lat: 12.9738, lng: 77.6119 }
};

// Default coordinates if location is not found (Bengaluru Center)
const DEFAULT_COORDS = { lat: 12.9716, lng: 77.5946 };

/**
 * Generate a polyline (list of lat-lng coordinates) between start and end.
 * Inserts realistic intermediate points based on the travel mode.
 */
function generateRoutePath(start, dest, mode) {
  const points = [start];
  
  // Create intermediate coordinates to simulate roads/tracks
  const midLat = (start.lat + dest.lat) / 2;
  const midLng = (start.lng + dest.lng) / 2;
  
  if (mode === 'Metro + Walk') {
    // Metro routes are typically straight segmented lines following main tracks
    // E.g., walking to station, metro ride, walking to destination
    const walkToStation = { 
      lat: start.lat + (midLat - start.lat) * 0.15, 
      lng: start.lng + (midLng - start.lng) * 0.15 
    };
    const metroRideMid = { lat: midLat, lng: midLng };
    const walkFromStation = { 
      lat: start.lat + (dest.lat - start.lat) * 0.85, 
      lng: start.lng + (dest.lng - start.lng) * 0.85 
    };
    points.push(walkToStation, metroRideMid, walkFromStation);
  } else if (mode === 'BMTC Bus') {
    // Bus routes follow roads, let's create a zig-zag route
    const busStop1 = { 
      lat: start.lat + (midLat - start.lat) * 0.3, 
      lng: start.lng + (midLng - start.lng) * 0.1 
    };
    const busStop2 = { lat: midLat, lng: midLng };
    const busStop3 = { 
      lat: midLat + (dest.lat - midLat) * 0.7, 
      lng: midLng + (dest.lng - midLng) * 0.9 
    };
    points.push(busStop1, busStop2, busStop3);
  } else {
    // Direct Cab - follows the fastest road routes, slightly different path
    const cabTurn1 = { 
      lat: start.lat + (midLat - start.lat) * 0.5, 
      lng: start.lng 
    };
    const cabTurn2 = { 
      lat: dest.lat - (dest.lat - midLat) * 0.5, 
      lng: dest.lng 
    };
    points.push(cabTurn1, cabTurn2);
  }
  
  points.push(dest);
  return points.map(p => [p.lat, p.lng]);
}

/**
 * Main route calculation service
 */
export async function getMultimodalRoutes(startName, destName, mockRain = false) {
  // 1. Geocode locations
  const startCoords = BENGALURU_LOCATIONS[startName] || DEFAULT_COORDS;
  const destCoords = BENGALURU_LOCATIONS[destName] || DEFAULT_COORDS;

  console.log(`[Routing Service] Finding routes from ${startName} to ${destName}`);

  // 2. Fetch Weather Data (Open-Meteo API)
  const weather = await getBengaluruWeather(mockRain);
  const isRainy = weather.rainProbability > 70;

  // 3. Define the base transit routes
  const baseRoutes = [
    {
      id: 'route-metro',
      type: 'Metro + Walk',
      icon: 'Subway',
      time: '40 min',
      cost: '₹35',
      baseSafety: 92,
      crowdLevel: 'Low',
      description: 'Purple/Green Line Express + 5 min walk.',
      deepLink: `nammayatri://book?drop=${encodeURIComponent(destName)}&mode=metro`
    },
    {
      id: 'route-bus',
      type: 'BMTC Bus',
      icon: 'Bus',
      time: '55 min',
      cost: '₹15',
      baseSafety: 76,
      crowdLevel: 'High',
      description: 'Vajra AC Bus Route 500C. High traffic congestion.',
      deepLink: null
    },
    {
      id: 'route-cab',
      type: 'Direct Cab',
      icon: 'Car',
      time: '35 min',
      cost: '₹250',
      baseSafety: 85,
      crowdLevel: 'Low',
      description: 'Direct cab via Outer Ring Rd. Dynamic pricing active.',
      deepLink: `nammayatri://book?drop=${encodeURIComponent(destName)}&mode=cab`
    }
  ];

  // 4. Calculate Overpass Streetlight Safety Scores and generate route paths
  const enrichedRoutes = await Promise.all(
    baseRoutes.map(async (route) => {
      // Simulate Overpass streetlight query
      const safetyDetails = await calculateSafetyScore(startCoords, destCoords, route.type);
      
      // Calculate coordinates path
      const path = generateRoutePath(startCoords, destCoords, route.type);

      return {
        ...route,
        safetyScore: safetyDetails.safetyScore,
        safetyDensity: safetyDetails.density,
        streetlightCount: safetyDetails.streetlightCount,
        path,
        startCoords: [startCoords.lat, startCoords.lng],
        destCoords: [destCoords.lat, destCoords.lng]
      };
    })
  );

  // 5. Apply Weather Prioritization Logic
  // If rain probability > 70%, we boost the Metro score and prioritize it
  let finalRoutes = [...enrichedRoutes];

  if (isRainy) {
    console.log(`[Routing Service] Rain is ${weather.rainProbability}% (>70%). Prioritizing Metro route!`);
    
    // Adjust time and priority for rainy weather (cab/bus times increase due to traffic waterlogging)
    finalRoutes = finalRoutes.map(route => {
      if (route.type === 'Metro + Walk') {
        return {
          ...route,
          isRecommended: true,
          recommendationReason: 'Rain Prioritized: Metro offers traffic-free travel in waterlogged streets.',
          crowdLevel: 'Medium' // Metro gets slightly more crowded during rain
        };
      } else if (route.type === 'BMTC Bus') {
        return {
          ...route,
          time: '75 min', // Traffic delays
          crowdLevel: 'Very High',
          recommendationReason: null
        };
      } else if (route.type === 'Direct Cab') {
        return {
          ...route,
          time: '60 min', // Heavy traffic delays
          cost: '₹380', // Surge pricing during rain
          recommendationReason: null
        };
      }
      return route;
    });

    // Sort Metro to the very top (index 0)
    const metroIdx = finalRoutes.findIndex(r => r.type === 'Metro + Walk');
    if (metroIdx > -1) {
      const [metroRoute] = finalRoutes.splice(metroIdx, 1);
      finalRoutes.unshift(metroRoute);
    }
  } else {
    // Fair weather logic - Cab is fastest but Metro is safest/most balanced
    finalRoutes = finalRoutes.map(route => {
      if (route.type === 'Metro + Walk') {
        return {
          ...route,
          isRecommended: true,
          recommendationReason: 'Safest & Fastest: Most reliable travel time with low carbon footprint.'
        };
      }
      return route;
    });
  }

  return {
    routes: finalRoutes,
    weatherAlert: {
      isRainy,
      rainProbability: weather.rainProbability,
      status: weather.status,
      message: isRainy 
        ? "Heavy Rain Expected in Bengaluru: Metro routes are currently prioritized to avoid severe waterlogging and traffic."
        : "Fair Weather in Bengaluru. All transit systems operating normally."
    }
  };
}
