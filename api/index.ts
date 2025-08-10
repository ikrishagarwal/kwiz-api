import { VercelRequest, VercelResponse } from "@vercel/node";

export default async (request: VercelRequest, response: VercelResponse) => {
  response.status(200).json({
    message: `Hello from Vercel! You made a ${request.method} request.`,
    timestamp: new Date().toISOString(),
  });
};
