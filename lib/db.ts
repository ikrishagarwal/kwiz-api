import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const {
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_DATABASE,
} = process.env;

export const db = new Pool({
  user: POSTGRES_USERNAME,
  database: POSTGRES_DATABASE,
  password: POSTGRES_PASSWORD,
  host: POSTGRES_HOST,
});
