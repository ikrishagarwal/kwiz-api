import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserStore } from "../../models/user.js";
import { KwizStore, Question } from "../../models/kwiz.js";

const userStore = new UserStore();
const kwizStore = new KwizStore();

export default async (request: VercelRequest, response: VercelResponse) => {
  const { id } = request.query as { id: string };

  if (!id) {
    response.status(400).json({ error: "Missing required fields" });
    return;
  }

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

  if (!user) {
    response //
      .status(401)
      .json({ error: "Invalid token" })
      .end();
    return;
  }

  const question = await kwizStore.getQuestionById(id);

  if (!question) {
    response.status(404).json({ error: "Question not found" }).end();
    return;
  }

  const kwizOwner = await kwizStore.getUserId(question.kwiz_id);

  if (!kwizOwner || kwizOwner.userid !== user.id) {
    response //
      .status(403)
      .json({ error: "Forbidden: You do not own this Kwiz" })
      .end();
    return;
  }

  switch (request.method) {
    case "GET":
      try {
        const question = await kwizStore.getQuestionById(id);

        if (!question) {
          response //
            .status(404)
            .json({ error: "Question not found" })
            .end();
        }
        response //
          .status(200)
          .json(question)
          .end();
        break;
      } catch (error) {
        console.error(error);
        response
          .status(500)
          .json({ error: "Failed to retrieve question" })
          .end();
      }

      break;
    case "DELETE":
      try {
        await kwizStore.deleteQuestionById(id);
        response.status(204).end();
      } catch (error) {
        console.error(error);
        response
          .status(500)
          .json({ error: "Failed to retrieve question" })
          .end();
      }
      break;

    case "PUT":
      try {
        const question = request.body as Question;
        if (
          !question ||
          !question.question ||
          !question.optionA ||
          !question.optionB
        ) {
          response.status(400).json({ error: "Missing required fields" }).end();
          break;
        }

        const updatedQuestion = await kwizStore.updateQuestionById(
          id,
          question
        );

        response.status(200).json(updatedQuestion).end();
      } catch (error) {
        console.error(error);
        response
          .status(500)
          .json({ error: "Failed to retrieve question" })
          .end();
      }
      break;

    default:
      response.status(405).json({ error: "Method not allowed" });
  }
};
