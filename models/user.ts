import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";

export type User = {
  id: string;
  email: string;
  password: string;
};

export class UserStore {
  async find(email: string): Promise<User | null> {
    try {
      const conn = await db.connect();
      const sql = "SELECT email, password FROM users WHERE email = ($1)";
      const result = await conn.query(sql, [email]);
      conn.release();

      if (result.rows.length) {
        return result.rows[0];
      }
      return null;
    } catch (error) {
      throw new Error(`Unable to retrieve user: ${error}`);
    }
  }

  async create(email: string, password: string): Promise<User> {
    try {
      const { nanoid } = await import("nanoid");
      const conn = await db.connect();
      const hash = await bcrypt.hash(password, 10);
      const id = nanoid();
      const sql =
        "INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING *";
      const result = await conn.query(sql, [id, email, hash]);
      conn.release();

      return result.rows[0];
    } catch (error) {
      throw new Error(`Unable to create user: ${error}`);
    }
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const conn = await db.connect();
      const sql = "SELECT * FROM users WHERE email = ($1)";
      const result = await conn.query(sql, [email]);

      if (result.rows.length) {
        const fetchedUser = result.rows[0];

        if (bcrypt.compareSync(password, fetchedUser.password)) {
          conn.release();
          return fetchedUser;
        }
      }

      conn.release();
      return null;
    } catch (error) {
      throw new Error(`Unable to authenticate user: ${error}`);
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<User | null> {
    try {
      const conn = await db.connect();
      const hash = await bcrypt.hash(newPassword, 10);
      const result = await conn.query(
        "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
        [hash, id]
      );
      conn.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Unable to update password: ${error}`);
    }
  }

  generateToken({ id, email }: User): string {
    return jwt.sign({ id, email }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
  }

  verifyToken(token: string): User | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as User;
    } catch {
      return null;
    }
  }
}
