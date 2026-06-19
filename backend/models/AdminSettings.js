const mongoose = require('mongoose');

const AdminSettingsSchema = new mongoose.Schema({
    username: { type: String, default: 'admin@slguide' },
    password: { type: String, default: 'admin123' },
    recoveryQuestion: { type: String, default: '' },
    recoveryAnswer: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('AdminSettings', AdminSettingsSchema);