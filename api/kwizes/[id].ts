import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserStore } from "../../models/user";
import { KwizStore, Question } from "../../models/kwiz";

const userStore = new UserStore();
const kwizStore = new KwizStore();

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

  const { id } = request.query as { id: string };

  const kwizOwner = await kwizStore.getUserId(id);

  if (kwizOwner === null || kwizOwner.userid !== user.id) {
    response //
      .status(403)
      .json({ error: "Forbidden: You do not own this Kwiz" })
      .end();
    return;
  }

  switch (request.method) {
    case "GET":
      try {
        const kwiz = await kwizStore.getById(id);
        response.status(200).json(kwiz).end();
      } catch (error) {
        console.error(error);
        response //
          .status(500)
          .json({ error: "Failed to retrieve Kwiz owner" })
          .end();
      }

      break;

    case "POST":
      try {
        const kwiz = await kwizStore.getById(id);
        if (!kwiz) {
          response //
            .status(404)
            .json({ error: "Kwiz not found" })
            .end();
          break;
        }

        const q = request.body as Question;

        if (!q || !q.question || !q.optionA || !q.optionB) {
          response //
            .status(400)
            .json({ error: "Missing required fields" })
            .end();
          break;
        }

        const result = await kwizStore.addQuestion(id, q);

        response.status(201).json(result).end();
      } catch (error) {
        console.error(error);
        response //
          .status(500)
          .json({ error: "Failed to create Kwiz" })
          .end();
      }
      break;

    case "DELETE":
      try {
        const kwiz = await kwizStore.getById(id);
        if (!kwiz) {
          response //
            .status(404)
            .json({ error: "Kwiz not found" })
            .end();
          return;
        }

        await kwizStore.deleteById(id);
        response.status(204).end();
      } catch (error) {
        console.error(error);
        response //
          .status(500)
          .json({ error: "Failed to delete Kwiz" })
          .end();
      }
      break;

    default:
      response //
        .status(405)
        .json({ error: "Method not allowed" })
        .end();
  }
};
