// routes/mobiliario.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Mobiliario ORDER BY id_mobiliario');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Mobiliario WHERE id_mobiliario = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const { nombre, color, tamano } = req.body;
    if (!nombre || !color || !tamano) return res.status(400).json({ error: 'Faltan campos' });
    const [result] = await pool.query('INSERT INTO Mobiliario (nombre, color, tamano) VALUES (?, ?, ?)', [nombre, color, tamano]);
    const [rows] = await pool.query('SELECT * FROM Mobiliario WHERE id_mobiliario = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE (partial)
router.put('/:id', async (req, res) => {
  try {
    const { nombre, color, tamano, estado } = req.body;
    await pool.query('UPDATE Mobiliario SET nombre = COALESCE(?, nombre), color = COALESCE(?, color), tamano = COALESCE(?, tamano), estado = COALESCE(?, estado) WHERE id_mobiliario = ?', [nombre, color, tamano, estado, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM Mobiliario WHERE id_mobiliario = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Mobiliario WHERE id_mobiliario = ?', [req.params.id]);
    res.json({ message: 'Eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Assign to event
router.post('/:id/assign', async (req, res) => {
  try {
    const id_mobiliario = req.params.id;
    const { id_evento } = req.body;
    if (!id_evento) return res.status(400).json({ error: 'id_evento requerido' });
    await pool.query('INSERT IGNORE INTO Evento_Mobiliario (id_evento, id_mobiliario) VALUES (?, ?)', [id_evento, id_mobiliario]);
    await pool.query("UPDATE Mobiliario SET estado = 'asignado' WHERE id_mobiliario = ?", [id_mobiliario]);
    res.json({ message: 'Asignado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Unassign
router.post('/:id/unassign', async (req, res) => {
  try {
    const id_mobiliario = req.params.id;
    const { id_evento } = req.body;
    if (!id_evento) return res.status(400).json({ error: 'id_evento requerido' });
    await pool.query('DELETE FROM Evento_Mobiliario WHERE id_evento = ? AND id_mobiliario = ?', [id_evento, id_mobiliario]);
    await pool.query("UPDATE Mobiliario SET estado = 'disponible' WHERE id_mobiliario = ?", [id_mobiliario]);
    res.json({ message: 'Desasignado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
