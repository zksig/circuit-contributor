import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkSession } from "@/services/privy";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }) {
  try {
    const { email } = await checkSession(request);
    if (!email) {
      return NextResponse.redirect("/login");
    }

    const ceremonies = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
        managerEmail: email,
      },
    });
    return NextResponse.json(ceremonies);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}
