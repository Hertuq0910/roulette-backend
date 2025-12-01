const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rouletteRoutes = require('./routes/rouletteRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conexión a MongoDB (modifica la URL según tu entorno)
mongoose
  .connect('mongodb://localhost:27017/roulette', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error', err));

app.use('/api/roulettes', rouletteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
