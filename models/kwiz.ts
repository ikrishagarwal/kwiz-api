import { db } from "../lib/db";

export type Kwiz = {
  userid: string;
  id: string;
  questions: Question[];
};

export interface Question {
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
}

export class KwizStore {
  async create(
    kwiz: Omit<Kwiz, "id">
  ): Promise<{ kwiz_id: string; questions: Question[] }> {
    try {
      const conn = await db.connect();
      const { nanoid } = await import("nanoid");
      const kwizId = nanoid();

      const createdKwiz = await conn.query(
        "INSERT INTO kwizes (userid, id) VALUES ($1, $2) RETURNING *",
        [kwiz.userid, kwizId]
      );

      const questions: Question[] = [];

      for (const q of kwiz.questions) {
        const { question, optionA, optionB, optionC, optionD } = q;
        const result = await conn.query(
          "INSERT INTO questions (kwiz_id, id, question, option_a, option_b, option_c, option_d) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, question, option_a AS optionA, option_b AS optionB, option_c AS optionC, option_d AS optionD",
          [kwizId, nanoid(), question, optionA, optionB, optionC, optionD]
        );

        questions.push(result.rows[0]);
      }

      return {
        kwiz_id: createdKwiz.rows[0].id,
        questions,
      };
    } catch (error) {
      throw new Error(`Unable to create a new Kwiz: ${error}`);
    }
  }

  async addQuestion(kwizId: string, q: Question): Promise<Question> {
    try {
      const { nanoid } = await import("nanoid");
      const { question, optionA, optionB, optionC, optionD } = q;
      const conn = await db.connect();
      const result = await conn.query(
        "INSERT INTO questions (kwiz_id, id, question, option_a, option_b, option_c, option_d) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, question, option_a AS optionA, option_b AS optionB, option_c AS optionC, option_d AS optionD",
        [kwizId, nanoid(), question, optionA, optionB, optionC, optionD]
      );
      conn.release();

      return result.rows[0];
    } catch (error) {
      throw new Error(`Unable to add question to Kwiz: ${error}`);
    }
  }

  async deleteQuestionById(questionId: string) {
    try {
      const conn = await db.connect();
      await conn.query("DELETE FROM questions WHERE id = ($1)", [questionId]);
      conn.release();
    } catch (error) {
      throw new Error(`Unable to delete question by ID: ${error}`);
    }
  }

  async getQuestionById(questionId: string): Promise<QuestionResponse | null> {
    try {
      const conn = await db.connect();
      const result = await conn.query(
        "SELECT * FROM questions WHERE id = ($1)",
        [questionId]
      );
      conn.release();

      return result.rows[0];
    } catch (error) {
      throw new Error(`Unable to retrieve question by ID: ${error}`);
    }
  }

  async updateQuestionById(
    questionId: string,
    q: Question
  ): Promise<QuestionResponse | null> {
    try {
      const { question, optionA, optionB, optionC, optionD } = q;
      const conn = await db.connect();
      const result = await conn.query(
        "UPDATE questions SET question = ($1), option_a = ($2), option_b = ($3), option_c = ($4), option_d = ($5) WHERE id = ($6) RETURNING *",
        [question, optionA, optionB, optionC, optionD, questionId]
      );
      conn.release();

      return result.rows[0];
    } catch (error) {
      throw new Error(`Unable to update question by ID: ${error}`);
    }
  }

  async getAll(userid: string): Promise<Kwiz[]> {
    try {
      const conn = await db.connect();
      const result = await conn.query(
        "SELECT * FROM kwizes WHERE userid = ($1)",
        [userid]
      );
      conn.release();

      return result.rows;
    } catch (error) {
      throw new Error(`Unable to retrieve kwizes: ${error}`);
    }
  }

  async getUserId(id: string): Promise<{ userid: string } | null> {
    try {
      const conn = await db.connect();
      const result = await conn.query(
        "SELECT userid FROM kwizes WHERE id = ($1)",
        [id]
      );
      conn.release();

      return result.rows[0];
    } catch (error) {
      throw new Error(`Unable to retrieve user ID for Kwiz: ${error}`);
    }
  }

  async getById(id: string): Promise<Kwiz[]> {
    try {
      const conn = await db.connect();
      const result = await conn.query(
        "SELECT kwiz_id, id, question, option_a AS optionA, option_b AS optionB, option_c AS optionC, option_d AS optionD FROM questions WHERE kwiz_id = ($1)",
        [id]
      );
      conn.release();

      return result.rows;
    } catch (error) {
      throw new Error(`Unable to retrieve Kwiz by ID: ${error}`);
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      const conn = await db.connect();
      await conn.query("DELETE FROM kwizes WHERE id = ($1)", [id]);
      conn.release();
    } catch (error) {
      throw new Error(`Unable to delete Kwiz by ID: ${error}`);
    }
  }
}

interface QuestionResponse {
  id: string;
  kwiz_id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}
