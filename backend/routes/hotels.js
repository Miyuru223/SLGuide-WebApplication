const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// GET all hotels (public)
router.get('/', async (req, res) => {
  try {
    const { category, district, search, stars } = req.query;
    let query = {};
    if (category) query.category = category;
    if (district) query.district = new RegExp(district, 'i');
    if (search) query.name = new RegExp(search, 'i');
    if (stars) query.starRating = parseInt(stars);
    const hotels = await Hotel.find(query).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET featured hotels (public)
router.get('/featured', async (req, res) => {
  try {
    const hotels = await Hotel.find({ featured: true }).limit(6);
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single hotel (public)
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create hotel (admin only)
router.post('/', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
    const hotel = new Hotel({ ...req.body, photos, amenities });
    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update hotel (admin only)
router.put('/:id', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Not found' });

    const newPhotos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const existingPhotos = req.body.existingPhotos
      ? JSON.parse(req.body.existingPhotos)
      : hotel.photos;
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : hotel.amenities;

    const updated = await Hotel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, photos: [...existingPhotos, ...newPhotos], amenities },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE hotel (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Not found' });

    hotel.photos.forEach(photo => {
      const filePath = path.join(__dirname, '..', photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
