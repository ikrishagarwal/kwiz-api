import { VercelRequest, VercelResponse } from "@vercel/node";

export default async (_: VercelRequest, response: VercelResponse) => {
  response.status(200).json({
    message: "Welcome to the Kwiz API!",
    paths: [
      "/signup",
      "/auth",
      "/password",
      "/kwizes",
      "/kwizes/id",
      "/questions/id",
    ],
    tip: "Go to `/` for a Swagger UI interface for testing this API",
  });
};
