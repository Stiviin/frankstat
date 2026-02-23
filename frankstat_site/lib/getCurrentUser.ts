import { parse } from "cookie";
import { verifyToken } from "./auth";
import prisma from "./prisma";

export async function getCurrentUser(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const { auth_token } = parse(cookie);
  if (!auth_token) return null;
  try {
    const payload: any = verifyToken(auth_token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user;
  } catch {
    return null;
  }
}
