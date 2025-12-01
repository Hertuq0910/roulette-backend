const mongoose = require('mongoose');

const rouletteSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['created', 'open', 'closed'],
    default: 'created'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  openedAt: Date,
  closedAt: Date
});

module.exports = mongoose.model('Roulette', rouletteSchema);
