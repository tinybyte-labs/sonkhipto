import { getSession } from "@acme/auth";
import { db } from "@acme/db";
import { NextRequest } from "next/server";

export async function createTRPCContext({ req }: { req: NextRequest }) {
  const session = await getSession(req);
  return { req, db, session };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
