import { FastifyEnvOptions } from "@fastify/env";

export const envOptions: FastifyEnvOptions = {
  confKey: "config",
  schema: {
    type: "object",
    required: ["PORT", "JWT_SECRET", "DATABASE_URL"],
    properties: {
      PORT: {
        type: "string",
        default: 8080,
      },
      DATABASE_URL: {
        type: "string",
      },
      JWT_SECRET: {
        type: "string",
      },
    },
  },
  dotenv: true,
  data: process.env,
};
