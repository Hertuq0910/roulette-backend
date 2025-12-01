const express = require('express');
const router = express.Router();
const Roulette = require('../models/Roulette');
const Bet = require('../models/Bet');

function getColorByNumber(number) {
  // Nota del enunciado:
  // "los números pares son rojos y los impares son negros"
  // 0 es par, entonces su color será 'red' según esta regla
  return number % 2 === 0 ? 'red' : 'black';
}

/**
 * 1. Crear nueva ruleta
 * POST /api/roulettes
 * Devuelve: { id: <id_ruleta> }
 */
router.post('/', async (req, res) => {
  try {
    const roulette = new Roulette();
    await roulette.save();
    return res.status(201).json({ id: roulette._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating roulette' });
  }
});

/**
 * 2. Abrir ruleta
 * PATCH /api/roulettes/:id/open
 * Devuelve: { success: true/false, message: '...' }
 */
router.patch('/:id/open', async (req, res) => {
  try {
    const { id } = req.params;
    const roulette = await Roulette.findById(id);

    if (!roulette) {
      return res.status(404).json({ success: false, message: 'Roulette not found' });
    }

    if (roulette.status === 'open') {
      return res.json({ success: false, message: 'Roulette already open' });
    }

    if (roulette.status === 'closed') {
      return res.json({ success: false, message: 'Roulette already closed' });
    }

    roulette.status = 'open';
    roulette.openedAt = new Date();
    await roulette.save();

    return res.json({ success: true, message: 'Roulette opened successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error opening roulette' });
  }
});

/**
 * 3. Apostar a un número o color
 * POST /api/roulettes/:id/bets
 * Headers: user-id: <id_usuario>
 *
 * Body:
 *  {
 *    "betType": "number" | "color",
 *    "number": 0-36 (si betType = "number"),
 *    "color": "red" | "black" (si betType = "color"),
 *    "amount": 1-10000
 *  }
 */
router.post('/:id/bets', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.header('user-id');
    const { betType, number, color, amount } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Missing user-id header' });
    }

    const roulette = await Roulette.findById(id);
    if (!roulette) {
      return res.status(404).json({ message: 'Roulette not found' });
    }

    if (roulette.status !== 'open') {
      return res.status(400).json({ message: 'Roulette is not open for bets' });
    }

    // Validaciones
    if (!['number', 'color'].includes(betType)) {
      return res.status(400).json({ message: 'Invalid betType' });
    }

    if (betType === 'number') {
      if (number === undefined || number < 0 || number > 36) {
        return res.status(400).json({ message: 'Invalid number. Must be between 0 and 36' });
      }
    }

    if (betType === 'color') {
      if (!['red', 'black'].includes(color)) {
        return res.status(400).json({ message: 'Invalid color. Must be red or black' });
      }
    }

    if (!amount || amount <= 0 || amount > 10000) {
      return res.status(400).json({ message: 'Invalid amount. Max is 10000' });
    }

    // Aquí se asume que el usuario tiene crédito suficiente (según enunciado)

    const bet = new Bet({
      rouletteId: id,
      userId,
      betType,
      number: betType === 'number' ? number : undefined,
      color: betType === 'color' ? color : undefined,
      amount
    });

    await bet.save();

    return res.status(201).json({
      message: 'Bet placed successfully',
      bet: {
        id: bet._id,
        rouletteId: bet.rouletteId,
        userId: bet.userId,
        betType: bet.betType,
        number: bet.number,
        color: bet.color,
        amount: bet.amount
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error placing bet' });
  }
});

/**
 * 4. Cerrar apuestas de una ruleta
 * POST /api/roulettes/:id/close
 *
 * Devuelve:
 * {
 *   winningNumber: number,
 *   winningColor: "red" | "black",
 *   bets: [
 *     {
 *       userId,
 *       betType,
 *       number,
 *       color,
 *       amount,
 *       isWinner,
 *       payout
 *     }
 *   ]
 * }
 */
router.post('/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const roulette = await Roulette.findById(id);

    if (!roulette) {
      return res.status(404).json({ message: 'Roulette not found' });
    }

    if (roulette.status !== 'open') {
      return res.status(400).json({ message: 'Roulette is not open or already closed' });
    }

    // Seleccionar número ganador aleatorio
    const winningNumber = Math.floor(Math.random() * 37); // 0-36
    const winningColor = getColorByNumber(winningNumber);

    // Obtener todas las apuestas de esa ruleta
    const bets = await Bet.find({ rouletteId: id });

    const resultBets = [];

    for (const bet of bets) {
      let isWinner = false;
      let payout = 0;

      if (bet.betType === 'number') {
        if (bet.number === winningNumber) {
          isWinner = true;
          payout = bet.amount * 5;
        }
      } else if (bet.betType === 'color') {
        if (bet.color === winningColor) {
          isWinner = true;
          payout = bet.amount * 1.8;
        }
      }

      bet.isWinner = isWinner;
      bet.payout = payout;
      bet.winningNumber = winningNumber;
      bet.winningColor = winningColor;
      await bet.save();

      resultBets.push({
        userId: bet.userId,
        betType: bet.betType,
        number: bet.number,
        color: bet.color,
        amount: bet.amount,
        isWinner,
        payout
      });
    }

    roulette.status = 'closed';
    roulette.closedAt = new Date();
    await roulette.save();

    return res.json({
      winningNumber,
      winningColor,
      bets: resultBets
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error closing roulette' });
  }
});

module.exports = router;
