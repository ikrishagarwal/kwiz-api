import { db } from "./db";

(async () => {
  const conn = await db.connect();
  try {
    console.log("INFO: Creating users table if it doesn't exists already");
    await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(21) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );`);

    console.log("INFO: Creating the kwizes table if it doesn't exists already");
    await conn.query(`
    CREATE TABLE IF NOT EXISTS kwizes (
      userid VARCHAR(21) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      id VARCHAR(21) PRIMARY KEY
    );`);

    console.log(
      "INFO: Creating the questions database if it doesn't exists already"
    );
    await conn.query(`
    CREATE TABLE IF NOT EXISTS questions (
      kwiz_id VARCHAR(21) NOT NULL REFERENCES kwizes(id) ON DELETE CASCADE,
      id VARCHAR(21) PRIMARY KEY,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL, 
      option_b TEXT NOT NULL,
      option_c TEXT,
      option_d TEXT
    );`);
  } catch (error) {
    console.error("Failed to do the database tasks:", error);
  } finally {
    conn.release();
  }
})();
