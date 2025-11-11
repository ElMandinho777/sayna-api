// routes/productos.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Productos ORDER BY id_producto');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Productos WHERE id_producto = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const { nombre, cantidad = 0 } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Falta nombre' });
    const [result] = await pool.query('INSERT INTO Productos (nombre, cantidad) VALUES (?, ?)', [nombre, cantidad]);
    const [rows] = await pool.query('SELECT * FROM Productos WHERE id_producto = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { nombre, cantidad } = req.body;
    await pool.query('UPDATE Productos SET nombre = COALESCE(?, nombre), cantidad = COALESCE(?, cantidad) WHERE id_producto = ?', [nombre, cantidad, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM Productos WHERE id_producto = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Productos WHERE id_producto = ?', [req.params.id]);
    res.json({ message: 'Eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
