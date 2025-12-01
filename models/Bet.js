const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  rouletteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roulette',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  betType: {
    type: String,
    enum: ['number', 'color'],
    required: true
  },
  number: {
    type: Number,
    min: 0,
    max: 36
  },
  color: {
    type: String,
    enum: ['red', 'black']
  },
  amount: {
    type: Number,
    min: 1,
    max: 10000,
    required: true
  },
  // Datos calculados al cerrar la ruleta
  isWinner: Boolean,
  payout: Number,
  winningNumber: Number,
  winningColor: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bet', betSchema);
