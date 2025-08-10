import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserStore } from "../models/user";

const store = new UserStore();

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "POST")
    return response.status(405).json({ error: "Method not allowed" }).end();

  const { email, password } = request.body as AuthBody;

  if (!email || !password) {
    return response
      .status(400)
      .json({ error: "Email and password are required" })
      .end();
  }

  try {
    const user = await store.find(email);
    if (user) {
      try {
        const authedUser = await store.authenticate(email, password);

        if (authedUser) {
          const token = store.generateToken(authedUser);
          return response
            .status(200)
            .json({ email: authedUser.email, token })
            .end();
        }
      } catch {
        return response
          .status(401)
          .json({ error: "Invalid credentials" })
          .end();
      }
    } else {
      const createdUser = await store.create(email, password);
      const token = store.generateToken(createdUser);

      return response //
        .status(201)
        .json({ email: createdUser.email, token })
        .end();
    }
  } catch {
    const user = await store.create(email, password);
    const token = store.generateToken(user);

    return response //
      .status(201)
      .json({ email: user.email, token })
      .end();
  }

  return response //
    .status(400)
    .json({ error: "Bad Request" })
    .end();
}

interface AuthBody {
  email: string;
  password: string;
}
