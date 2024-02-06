import { FastifyRequest, FastifyReply } from "fastify";
import { $Enums } from "@acme/db";

export type Payload = {
  id: string;
  name: string | null;
  role: $Enums.UserRole;
};

export const getSession = async (req: FastifyRequest, reply: FastifyReply) => {
  return req.jwtVerify() as Promise<Payload>;
};
