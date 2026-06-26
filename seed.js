const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const categories = ['Electronics', 'Clothing', 'Books', 'Sports', 'Home', 'Beauty', 'Toys', 'Automotive', 'Food', 'Garden'];

async function seed() {
  console.log('Seeding 200,000 products...');

  await pool.query(`
    INSERT INTO products (name, category, price, created_at, updated_at)
    SELECT
      'Product ' || i,
      (ARRAY['Electronics','Clothing','Books','Sports','Home','Beauty','Toys','Automotive','Food','Garden'])[floor(random()*10)+1],
      ROUND((random() * 9990 + 10)::numeric, 2),
      NOW() - (random() * INTERVAL '2 years'),
      NOW() - (random() * INTERVAL '2 years')
    FROM generate_series(1, 200000) AS i;
  `);

  console.log('Done!');
  await pool.end();
}

seed().catch(console.error);