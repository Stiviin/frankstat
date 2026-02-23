// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import nodemailer from "nodemailer";

const bodySchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(9).optional(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash,
      },
    });

    // TODO: send verification email (simple placeholder)
    // Create a verification token (JWT or random token) and email link to user.email
    // Example using nodemailer (configure SMTP via env)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const verifyToken = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verifyToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Verify your Frankstat account",
        text: `Click to verify: ${verifyUrl}`,
        html: `<p>Click to verify: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
      });
    } catch (err) {
      // log but don't fail registration
      console.error("Email send failed", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
  return NextResponse.json(
    { error: err.message || "Something went wrong" },
    { status: 400 }
  );
}

}
