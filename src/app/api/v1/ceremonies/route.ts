import { prisma } from "@/services/prisma";
import { checkSession } from "@/services/privy";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await checkSession(request);
    if (!email) {
      return NextResponse.redirect("/login");
    }

    const { label } = await request.json();

    const ceremony = await prisma.ceremony.create({
      data: {
        managerEmail: email,
        label,
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
      include: {
        _count: true,
      },
    });
    return NextResponse.json(ceremonies);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}
