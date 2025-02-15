import type { User, UserRole } from "@acme/db";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export type Payload = {
  id: string;
  name: string | null;
  role: UserRole;
};

export const getSession = async (req: NextRequest): Promise<Payload | null> => {
  const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!accessToken) {
    return null;
  }
  try {
    const payload = await jwt.verify(accessToken, process.env.JWT_SECRET!);
    return payload as Payload;
  } catch (error) {
    return null;
  }
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
