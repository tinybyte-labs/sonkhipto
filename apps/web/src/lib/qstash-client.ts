import { Client } from "@upstash/qstash";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const qstashClient = new Client({ token: process.env.QSTASH_TOKEN! });
