import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth"; // your existing helper

export async function GET() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });
  
  try {
    const payload = verifyToken(token); // decode your JWT
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}