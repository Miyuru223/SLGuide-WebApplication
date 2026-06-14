const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
  category: {
    type: String,
    enum: ['Ancient City', 'Temple', 'Natural Wonder', 'Beach', 'Fort', 'Museum', 'Cultural Site', 'Wildlife'],
    required: true
  },
  description: { type: String, required: true },
  history: { type: String },
  entryFee: { type: String, default: 'Free' },
  openingHours: { type: String, default: '6:00 AM - 6:00 PM' },
  bestTimeToVisit: { type: String },
  mapUrl: { type: String },
  photos: [{ type: String }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Destination', destinationSchema);
