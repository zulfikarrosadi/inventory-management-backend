import path from "node:path";
import dotenv from "dotenv";
import { type JwtPayload, sign, verify } from "jsonwebtoken";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * 10 minutes in ms
 */
export const accessTokenMaxAge = 600000;
/**
 * 10 days in ms
 */
export const refreshTokenMaxAge = 864000000;
const tokenSecret = process.env.TOKEN_SECRET as string;
type decodedType = JwtPayload & { userId: number; email: string };

export function verifyToken(token: string): {
  decodedData: decodedType | null;
} {
  try {
    const decoded = verify(token, tokenSecret, {
      algorithms: ["HS256"],
    }) as decodedType;

    return { decodedData: decoded };
  } catch (_) {
    return { decodedData: null };
  }
}

export function createNewToken(data: {
  email: string;
  userId: number;
  expiration: number;
}) {
  const token = sign(
    { tokenId: Math.random(), email: data.email, userId: data.userId },
    tokenSecret,
    {
      algorithm: "HS256",
      expiresIn: data.expiration,
    },
  );
  return token;
}
