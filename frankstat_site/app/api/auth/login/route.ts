// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
<<<<<<< HEAD
import prisma from "@/lib/prisma";
=======
import { prisma } from "@/lib/prisma";
>>>>>>> 8f2e237 (Save local)
import { verifyPassword, signToken, createAuthCookie } from "@/lib/auth";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = bodySchema.parse(json);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ sub: user.id, email: user.email });
    const cookie = createAuthCookie(token);

    const res = NextResponse.json({ ok: true, user: { id: user.id, fullName: user.fullName, email: user.email } });
    res.headers.append("Set-Cookie", cookie);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}
