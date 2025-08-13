import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserStore } from "../models/user";

const userStore = new UserStore();

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    response.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (!email.includes("@") || email.length < 5) {
    response
      .status(400)
      .json({ error: "Invalid email format, try again with a correct email!" });
    return;
  }

  if (password.length < 6 || password.length > 20) {
    response
      .status(400)
      .json({
        error: "Password is either too short or too long!",
      })
      .end();
    return;
  }

  try {
    const dbUser = await userStore.find(email);

    if (dbUser) {
      response.status(409).json({ error: "The email is already signed up" });
      return;
    }

    await userStore.create(email, password);
    response.status(201).json({ message: "User created successfully" });
  } catch (error) {
    response.status(500).json({ error: "Internal Server Error" });
  }
};
