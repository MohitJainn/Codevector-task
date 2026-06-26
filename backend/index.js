require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});
app.get('/products', async (req, res) => {
  try{
     
    const { category, cursor_created_at, cursor_id, limit = 20 } = req.query;

  const values = [];
  let where = [];
  let idx = 1;

  if (category) {
    where.push(`category = $${idx++}`);
    values.push(category);
  }

  if (cursor_created_at && cursor_id) {
    where.push(`(created_at, id) < ($${idx++}, $${idx++})`);
    values.push(cursor_created_at, cursor_id);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  values.push(parseInt(limit));

  const query = `
    SELECT id, name, category, price, created_at, updated_at
    FROM products
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT $${idx}
  `;

  const result = await pool.query(query, values);
  const rows = result.rows;

  const nextCursor = rows.length === parseInt(limit) ? {
    cursor_created_at: rows[rows.length - 1].created_at,
    cursor_id: rows[rows.length - 1].id
  } : null;

  res.json({ data: rows, nextCursor });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));