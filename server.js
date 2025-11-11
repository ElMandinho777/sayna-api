// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const eventosRouter = require('./routes/eventos');
const mobiliarioRouter = require('./routes/mobiliario');
const productosRouter = require('./routes/productos');

const app = express();
app.use(cors()); // habilita CORS
app.use(bodyParser.json());

app.use('/api/eventos', eventosRouter);
app.use('/api/mobiliario', mobiliarioRouter);
app.use('/api/productos', productosRouter);

app.get('/', (req, res) => res.json({ ok: true, message: 'API SaynaD running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
