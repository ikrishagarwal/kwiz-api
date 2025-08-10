import { VercelRequest, VercelResponse } from "@vercel/node";
import { KwizStore } from "../models/kwiz";
import { UserStore } from "../models/user";

const store = new KwizStore();
const userStore = new UserStore();

export default async (request: VercelRequest, response: VercelResponse) => {
  if (!request.headers.authorization?.startsWith("Bearer ")) {
    response //
      .status(401)
      .json({ error: "Unauthorized" })
      .end();
    return;
  }

  const user = userStore.verifyToken(
    request.headers.authorization.split(" ")[1]
  );

  if (user === null) {
    response //
      .status(401)
      .json({ error: "Invalid token" })
      .end();
    return;
  }

  switch (request.method) {
    case "GET":
      try {
        const kwizes = await store.getAll(user.id);
        response.status(200).json(kwizes).end();
      } catch {
        response.status(500).json({ error: "Failed to retrieve kwizes" });
      }
      break;

    case "POST":
      const questions = [];

      if (
        !request.body ||
        !request.body["questions"] ||
        !Array.isArray(request.body["questions"])
      ) {
        response.status(400).json({ error: "Invalid request body" }).end();
        break;
      }

      for (const q of request.body["questions"]) {
        if (!q.question || !q.optionA || !q.optionB) {
          response.status(400).json({ error: "Invalid question format" }).end();
          break;
        }
        questions.push(q);
      }

      try {
        const kwiz = await store.create({
          userid: user.id,
          questions,
        });

        response.status(201).json(kwiz).end();
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Failed to create kwiz" }).end();
      }
      break;
    default:
      response.status(405).end();
  }
};
