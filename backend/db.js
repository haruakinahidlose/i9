import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default {
  run(query, params = []) {
    return pool.query(query, params);
  },

  get(query, params = []) {
    return pool.query(query, params).then(res => res.rows[0] || null);
  },

  all(query, params = []) {
    return pool.query(query, params).then(res => res.rows);
  }
};
