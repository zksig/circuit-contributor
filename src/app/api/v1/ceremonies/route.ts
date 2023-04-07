import { checkSession } from "@/services/privy";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await checkSession(request);
    if (!email) {
      return NextResponse.redirect("/login");
    }

    const { label, startDate } = await request.json();

    const ceremony = await prisma.ceremony.create({
      data: {
        managerEmail: email,
        label,
        startDate: new Date(startDate),
      },
    });
    return NextResponse.json(ceremony);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}

export async function GET(request: Request) {
  try {
    const { email } = await checkSession(request);
    if (!email) {
      return NextResponse.redirect("/login");
    }

    const ceremonies = await prisma.ceremony.findMany({
      where: {
        managerEmail: email,
      },
    });
    return NextResponse.json(ceremonies);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}
