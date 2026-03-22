import pg from 'pg';
import { loadEnv } from './env.js';

const env = loadEnv();
const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export { pool };
export default pool;
