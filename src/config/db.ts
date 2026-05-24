import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const initDB=async ()=>{
    try{
        // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255)  NOT NULL,
        email      VARCHAR(255)  UNIQUE NOT NULL,
        password   TEXT          NOT NULL,
        role       VARCHAR(20)   NOT NULL DEFAULT 'contributor'
                   CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);


// Issues table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(150)  NOT NULL,
        description TEXT          NOT NULL
                    CHECK (LENGTH(description) >= 20),
        type        VARCHAR(20)   NOT NULL
                    CHECK (type IN ('bug', 'feature_request')),
        status      VARCHAR(20)   NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER       NOT NULL,
        created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);


    }catch(error){
        console.log('Database connection failed:', error);
    }
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;