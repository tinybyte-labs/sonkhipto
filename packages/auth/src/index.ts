import { FastifyRequest } from "fastify";
import { $Enums, User } from "@acme/db";
import jwt from "jsonwebtoken";

export type Payload = {
  id: string;
  name: string | null;
  role: $Enums.UserRole;
};

export const getSession = async (req: FastifyRequest) => {
  const accessToken = req.headers.authorization?.replace("Bearer ", "");
  if (!accessToken) {
    throw new Error("Unauthorized");
  }
  const payload = await jwt.verify(accessToken, process.env.JWT_SECRET!);
  return payload as Payload;
};

export const signJwt = async (user: User) => {
  const payload: Payload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  const token = await jwt.sign(payload, process.env.JWT_SECRET!);
  return token;
};
