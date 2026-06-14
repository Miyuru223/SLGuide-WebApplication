const express = require('express');
const router = express.Router();

// Map Sri Lanka district names to city names OpenWeatherMap understands
const DISTRICT_TO_CITY = {
  'Colombo':      'Colombo,LK',
  'Gampaha':      'Gampaha,LK',
  'Kalutara':     'Kalutara,LK',
  'Kandy':        'Kandy,LK',
  'Matale':       'Matale,LK',
  'Nuwara Eliya': 'Nuwara Eliya,LK',
  'Galle':        'Galle,LK',
  'Matara':       'Matara,LK',
  'Hambantota':   'Hambantota,LK',
  'Jaffna':       'Jaffna,LK',
  'Kilinochchi':  'Kilinochchi,LK',
  'Mannar':       'Mannar,LK',
  'Vavuniya':     'Vavuniya,LK',
  'Mullaitivu':   'Mullaitivu,LK',
  'Batticaloa':   'Batticaloa,LK',
  'Ampara':       'Ampara,LK',
  'Trincomalee':  'Trincomalee,LK',
  'Kurunegala':   'Kurunegala,LK',
  'Puttalam':     'Puttalam,LK',
  'Anuradhapura': 'Anuradhapura,LK',
  'Polonnaruwa':  'Polonnaruwa,LK',
  'Badulla':      'Badulla,LK',
  'Monaragala':   'Monaragala,LK',
  'Ratnapura':    'Ratnapura,LK',
  'Kegalle':      'Kegalle,LK',
};

// GET /api/weather/:district
router.get('/:district', async (req, res) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'Weather API key not configured' });
  }

  const rawDistrict = req.params.district;

  // Find the best city match (case-insensitive)
  const matchedKey = Object.keys(DISTRICT_TO_CITY).find(
    k => k.toLowerCase() === rawDistrict.toLowerCase()
  );
  const city = matchedKey
    ? DISTRICT_TO_CITY[matchedKey]
    : `${rawDistrict},LK`;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      // Fallback: try just "Sri Lanka" for unknown districts
      const fallbackUrl = `https://api.openweathermap.org/data/2.5/weather?q=Colombo,LK&appid=${apiKey}&units=metric`;
      const fallback = await fetch(fallbackUrl);
      if (!fallback.ok) {
        return res.status(404).json({ message: 'Weather data not available' });
      }
      const data = await fallback.json();
      return res.json({ ...data, isFallback: true });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

module.exports = router;