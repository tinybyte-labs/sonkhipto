import jwt from "jsonwebtoken";

export type JwtPayload = {
  sub: string;
  name: string;
};

export const verifyAuthorization = (token: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

export const signAuthorizationToken = (payload: JwtPayload) => {
  const token = jwt.sign(payload, "secret", { expiresIn: 60 * 60 });
  return token;
};
