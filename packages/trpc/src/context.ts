import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { db } from "@acme/db";
import { Payload, getSession } from "@acme/auth";

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  let session: Payload | null = null;
  try {
    session = await getSession(req, res);
  } catch (error: any) {}
  return { req, res, db, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
