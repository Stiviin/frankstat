import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const userId = "current-user-id"; // replace with auth context
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const userId = "current-user-id"; // replace with auth context
  const data = await req.json();
  const user = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json(user);
}
