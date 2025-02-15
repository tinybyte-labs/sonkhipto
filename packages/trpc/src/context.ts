import { db } from "@acme/db";
import { Payload, getSession } from "@acme/auth";
import { NextRequest } from "next/server";
import { inferAsyncReturnType } from "@trpc/server";

export async function createTRPCContext({ req }: { req: NextRequest }) {
  const session = await getSession(req);
  return { req, db, session };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
