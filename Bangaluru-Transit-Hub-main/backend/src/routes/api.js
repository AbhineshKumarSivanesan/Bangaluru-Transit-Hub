import express from 'express';
import { getBengaluruWeather } from '../services/weatherService.js';
import { getMultimodalRoutes, BENGALURU_LOCATIONS } from '../services/routingService.js';

const router = express.Router();

// GET /api/weather
router.get('/weather', async (req, res) => {
  try {
    const mockRain = req.query.mockRain === 'true';
    const weatherData = await getBengaluruWeather(mockRain);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// POST /api/routes
router.post('/routes', async (req, res) => {
  try {
    const { start, destination } = req.body;
    const mockRain = req.query.mockRain === 'true' || req.body.mockRain === true;

    if (!start || !destination) {
      return res.status(400).json({ error: 'Both "start" and "destination" fields are required.' });
    }

    // Call routing service
    const routingResult = await getMultimodalRoutes(start, destination, mockRain);

    // Return the array of 3 route objects as requested by the specification
    res.json(routingResult.routes);
  } catch (error) {
    console.error('Error calculating routes:', error);
    res.status(500).json({ error: 'Failed to calculate routes' });
  }
});

// GET /api/locations
// Auxiliary endpoint to help the frontend build start/destination selection dropdowns
router.get('/locations', (req, res) => {
  res.json(Object.keys(BENGALURU_LOCATIONS));
});

export default router;
