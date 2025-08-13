import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserStore } from "../models/user";

const userStore = new UserStore();

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method !== "PUT") {
    response //
      .status(405)
      .json({ error: "Method Not Allowed" })
      .end();
    return;
  }

  if (!request.headers.authorization?.startsWith("Bearer ")) {
    response //
      .status(401)
      .json({ error: "Unauthorized" })
      .end();
    return;
  }

  try {
    const user = userStore.verifyToken(
      request.headers.authorization.split(" ")[1]
    );

    if (!user) {
      response //
        .status(401)
        .json({ error: "Invalid Token" })
        .end();
      return;
    }

    const { password } = request.query as { password: string };

    if (!password || password.length < 6 || password.length > 20) {
      response //
        .status(400)
        .json({
          error: "Password must be between 6 and 20 characters long",
        });
      return;
    }

    const updatedUser = await userStore.updatePassword(user.id, password);

    if (!updatedUser) {
      response //
        .status(400)
        .json({ error: "Failed to update password, try again." })
        .end();
      return;
    }

    response //
      .status(200)
      .json({
        message: "Password updated successfully",
      })
      .end();
  } catch (error) {
    console.error(error);
    response //
      .status(500)
      .json({ error: "Internal Server Error" })
      .end();
  }
};
