// routes/eventos.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all eventos (with mobiliario)
router.get('/', async (req, res) => {
  try {
    const [eventos] = await pool.query('SELECT * FROM Eventos ORDER BY fecha, hora');
    const results = [];
    for (const ev of eventos) {
      const [mobiliarios] = await pool.query(
        `SELECT m.* FROM Mobiliario m JOIN Evento_Mobiliario em ON m.id_mobiliario = em.id_mobiliario WHERE em.id_evento = ?`,
        [ev.id_evento]
      );
      results.push({ ...ev, mobiliario: mobiliarios });
    }
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Eventos WHERE id_evento = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    const ev = rows[0];
    const [mobiliarios] = await pool.query(
      `SELECT m.* FROM Mobiliario m JOIN Evento_Mobiliario em ON m.id_mobiliario = em.id_mobiliario WHERE em.id_evento = ?`,
      [ev.id_evento]
    );
    res.json({ ...ev, mobiliario: mobiliarios });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const { cliente, fecha, hora, ubicacion = '', direccion } = req.body;
    if (!cliente || !fecha || !hora || !direccion) return res.status(400).json({ error: 'Faltan campos' });
    const [result] = await pool.query('INSERT INTO Eventos (cliente, fecha, hora, ubicacion, direccion) VALUES (?, ?, ?, ?, ?)', [cliente, fecha, hora, ubicacion, direccion]);
    const [rows] = await pool.query('SELECT * FROM Eventos WHERE id_evento = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { cliente, fecha, hora, ubicacion, direccion } = req.body;
    await pool.query('UPDATE Eventos SET cliente = COALESCE(?, cliente), fecha = COALESCE(?, fecha), hora = COALESCE(?, hora), ubicacion = COALESCE(?, ubicacion), direccion = COALESCE(?, direccion) WHERE id_evento = ?', [cliente, fecha, hora, ubicacion, direccion, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM Eventos WHERE id_evento = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Eventos WHERE id_evento = ?', [req.params.id]);
    res.json({ message: 'Evento eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// add mobiliario
router.post('/:id/add-mobiliario', async (req, res) => {
  try {
    const id_evento = req.params.id;
    const { id_mobiliario } = req.body;
    if (!id_mobiliario) return res.status(400).json({ error: 'id_mobiliario requerido' });
    await pool.query('INSERT IGNORE INTO Evento_Mobiliario (id_evento, id_mobiliario) VALUES (?, ?)', [id_evento, id_mobiliario]);
    await pool.query("UPDATE Mobiliario SET estado = 'asignado' WHERE id_mobiliario = ?", [id_mobiliario]);
    res.json({ message: 'Mobiliario asignado al evento' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// remove mobiliario
router.post('/:id/remove-mobiliario', async (req, res) => {
  try {
    const id_evento = req.params.id;
    const { id_mobiliario } = req.body;
    if (!id_mobiliario) return res.status(400).json({ error: 'id_mobiliario requerido' });
    await pool.query('DELETE FROM Evento_Mobiliario WHERE id_evento = ? AND id_mobiliario = ?', [id_evento, id_mobiliario]);
    await pool.query("UPDATE Mobiliario SET estado = 'disponible' WHERE id_mobiliario = ?", [id_mobiliario]);
    res.json({ message: 'Mobiliario removido del evento' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
