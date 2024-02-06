import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { db } from "../lib/db";

export interface User {
  name: string[] | string;
}

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const user: User = { name: req.headers.username ?? "anonymous" };

  return { req, res, user, db };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
