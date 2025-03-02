import "@fastify/jwt";
import { Payload } from "@acme/auth";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: Payload;
        user: Payload;
    }
}