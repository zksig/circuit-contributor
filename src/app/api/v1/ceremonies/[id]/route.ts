import { prisma } from "@/services/prisma";
import { checkSession } from "@/services/privy";
import HttpError from "@/utils/HttpError";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }) {
  try {
    const { email } = await checkSession(request);
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
        managerEmail: email,
      },
      include: {
        _count: true,
      },
    });
    if (!ceremony) {
      throw new HttpError("Not Found", 404);
    }

    return NextResponse.json(ceremony);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
