const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// GET all destinations (public)
router.get('/', async (req, res) => {
  try {
    const { category, district, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (district) query.district = new RegExp(district, 'i');
    if (search) query.name = new RegExp(search, 'i');
    const destinations = await Destination.find(query).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET featured destinations (public)
router.get('/featured', async (req, res) => {
  try {
    const destinations = await Destination.find({ featured: true }).limit(6);
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single destination (public)
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Not found' });
    res.json(destination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create destination (admin only)
router.post('/', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const destination = new Destination({ ...req.body, photos });
    await destination.save();
    res.status(201).json(destination);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update destination (admin only)
router.put('/:id', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Not found' });

    const newPhotos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const existingPhotos = req.body.existingPhotos
      ? JSON.parse(req.body.existingPhotos)
      : destination.photos;

    const updated = await Destination.findByIdAndUpdate(
      req.params.id,
      { ...req.body, photos: [...existingPhotos, ...newPhotos] },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE destination (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Not found' });

    // Delete associated photos
    destination.photos.forEach(photo => {
      const filePath = path.join(__dirname, '..', photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Destination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
