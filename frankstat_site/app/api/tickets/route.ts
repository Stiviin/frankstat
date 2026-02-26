import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const ticket = await prisma.supportTicket.create({ data });
    return NextResponse.json(ticket);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
