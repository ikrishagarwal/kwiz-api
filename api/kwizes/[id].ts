import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserStore } from "../../models/user";
import { KwizStore } from "../../models/kwiz";

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

  switch (request.method) {
    case "GET":
      try {
        const kwizOwner = await kwizStore.getUserId(id);

        if (kwizOwner === null || kwizOwner.userid !== user.id) {
          response //
            .status(403)
            .json({ error: "Forbidden: You do not own this Kwiz" })
            .end();
          break;
        }

        const kwiz = await kwizStore.getById(id);
        response.status(200).json(kwiz).end();
      } catch {
        response //
          .status(500)
          .json({ error: "Failed to retrieve Kwiz owner" })
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
