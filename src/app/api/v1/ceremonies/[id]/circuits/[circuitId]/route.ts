import { prisma } from "@/services/prisma";
import HttpError from "@/utils/HttpError";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }) {
  try {
    const circuit = await prisma.circuit.findFirst({
      where: {
        id: params.circuitId,
      },
    });
    if (!circuit) throw new HttpError("Missing circuit", 404);

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const location = circuit[`${type}Location`];
    if (!location) throw new HttpError(`Invalid type: ${type}`, 404);

    return NextResponse.redirect(
      `https://link.storjshare.io/s/jxa45axfvthgxrw3bz24uskxcvzq/circuit-contributor/${location}?download=1`,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
