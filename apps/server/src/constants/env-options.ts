import { FastifyEnvOptions } from "@fastify/env";

export const envOptions: FastifyEnvOptions = {
  confKey: "config",
  schema: {
    type: "object",
    required: ["PORT", "MONGODB_URI"],
    properties: {
      PORT: {
        type: "string",
        default: 8080,
      },
      MONGODB_URI: {
        type: "string",
        default: "mongodb://user:password@localhost:27017",
      },
    },
  },
  dotenv: true,
  data: process.env,
};
