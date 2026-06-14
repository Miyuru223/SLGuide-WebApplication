const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // Religious, Cultural, Festival, National, Music, Food
  description: { type: String, required: true },
  isRecurringAnnual: { type: Boolean, default: false }, // for festivals that happen every year
  duration: { type: String, default: '' }, // e.g. "3 days"
  photos: [{ type: String }],
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);