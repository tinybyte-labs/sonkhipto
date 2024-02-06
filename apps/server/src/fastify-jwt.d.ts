import "@fastify/jwt";
import { $Enums, User } from "@prisma/client";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      name: string | null;
      role: $Enums.UserRole;
    };
    user: {
      id: string;
      name: string | null;
      role: $Enums.UserRole;
    };
  }
}
