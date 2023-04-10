import { prisma } from "@/services/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }) {
  try {
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
      },
      include: {
        _count: true,
      },
    });
    return NextResponse.json(ceremony);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}
