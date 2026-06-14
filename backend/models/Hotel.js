const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
  starRating: { type: Number, min: 1, max: 5, required: true },
  category: {
    type: String,
    enum: ['Luxury', 'Boutique', 'Budget', 'Resort', 'Guesthouse', 'Heritage'],
    required: true
  },
  description: { type: String, required: true },
  amenities: [{ type: String }],
  priceRange: { type: String, required: true },
  contactPhone: { type: String },
  contactEmail: { type: String },
  website: { type: String },
  mapUrl: { type: String },
  photos: [{ type: String }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', hotelSchema);
