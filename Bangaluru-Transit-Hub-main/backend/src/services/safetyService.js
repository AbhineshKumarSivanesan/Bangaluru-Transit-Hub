/**
 * Simulates calling the Overpass API to count streetlights (highway=street_lamp)
 * in a bounding box between start and end coordinates.
 * Returns a safety score based on density and a mock streetlight count.
 */
export async function calculateSafetyScore(startCoords, destCoords, routeType) {
  // Simulate network latency for Overpass API query (150ms - 300ms)
  const latency = Math.floor(Math.random() * 150) + 150;
  await new Promise(resolve => setTimeout(resolve, latency));

  const minLat = Math.min(startCoords.lat, destCoords.lat);
  const maxLat = Math.max(startCoords.lat, destCoords.lat);
  const minLon = Math.min(startCoords.lng, destCoords.lng);
  const maxLon = Math.max(startCoords.lng, destCoords.lng);

  console.log(`[Overpass API Simulation] Querying bounding box: [${minLat.toFixed(4)}, ${minLon.toFixed(4)}, ${maxLat.toFixed(4)}, ${maxLon.toFixed(4)}] for 'highway=street_lamp'`);

  // Compute a base density derived deterministically from coordinates so it is repeatable
  const area = Math.max((maxLat - minLat) * (maxLon - minLon) * 111 * 111, 0.5); // approximate area in km^2
  
  // Seed-like calculation from lat/lng sums
  const coordSum = startCoords.lat + startCoords.lng + destCoords.lat + destCoords.lng;
  const seed = Math.floor(coordSum * 1000) % 100;
  
  // Base streetlight counts depending on the route environment
  let baseDensity = 25; // lamps per km^2
  if (routeType === 'Metro + Walk') {
    // Metro corridors and walkways are typically well-lit in Bengaluru
    baseDensity = 45 + (seed % 15);
  } else if (routeType === 'BMTC Bus') {
    // Main bus routes are lit, but walking to/from bus stops might have darker stretches
    baseDensity = 28 + (seed % 10);
  } else if (routeType === 'Direct Cab') {
    // Cab routes are along major arterial roads, highly lit, but pick/drop points vary
    baseDensity = 35 + (seed % 12);
  }

  const simulatedLamps = Math.round(baseDensity * area);
  
  // Safety Score mapping (0-100 scale)
  // We assume a streetlight density of >= 50 lamps/km^2 yields a score of 95+
  let safetyScore = Math.min(65 + Math.round((baseDensity / 60) * 30), 98);

  console.log(`[Overpass API Simulation] Found ${simulatedLamps} streetlights (Density: ${baseDensity.toFixed(1)}/km²). Calculated Safety Score: ${safetyScore}/100`);

  return {
    safetyScore,
    density: parseFloat(baseDensity.toFixed(1)),
    streetlightCount: simulatedLamps
  };
}
