const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// GET all events (public)
router.get('/', async (req, res) => {
  try {
    const { category, district, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (district) query.district = new RegExp(district, 'i');
    if (search) query.name = new RegExp(search, 'i');
    const events = await Event.find(query).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET featured events (public)
router.get('/featured', async (req, res) => {
  try {
    const events = await Event.find({ featured: true }).limit(6);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single event (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create event (admin only)
router.post('/', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const event = new Event({ ...req.body, photos });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update event (admin only)
router.put('/:id', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });

    const newPhotos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const existingPhotos = req.body.existingPhotos
      ? JSON.parse(req.body.existingPhotos)
      : event.photos;

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, photos: [...existingPhotos, ...newPhotos] },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE event (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });

    event.photos.forEach(photo => {
      const filePath = path.join(__dirname, '..', photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;