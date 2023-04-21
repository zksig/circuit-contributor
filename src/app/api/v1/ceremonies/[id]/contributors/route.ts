import { prisma } from "@/services/prisma";
import { checkSession } from "@/services/privy";
import HttpError from "@/utils/HttpError";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }) {
  try {
    const { email } = await checkSession(request);
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
      },
    });
    if (!ceremony) throw new HttpError("Missing ceremony", 404);

    const { name } = await request.json();
    const contributor = await prisma.contributor.create({
      data: {
        ceremonyId: params.id,
        email,
        name,
      },
    });

    return NextResponse.json(contributor);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

export async function GET(request: Request, { params }) {
  try {
    const contributors = await prisma.contributor.findMany({
      where: {
        ceremonyId: params.id,
      },
    });

    return NextResponse.json(contributors);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
