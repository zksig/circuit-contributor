import { prisma } from "@/services/prisma";
import { checkSession } from "@/services/privy";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT,
});

export async function POST(request: Request, { params }) {
  try {
    const { email } = await checkSession(request);
    if (!email) {
      return NextResponse.redirect("/login");
    }

    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
      },
    });
    if (!ceremony) throw new Error("Missing ceremony");

    const { circuitId, name, hash, sequenceNumber } = await request.json();

    const circuit = await prisma.circuit.findFirst({
      where: {
        id: circuitId,
        ceremonyId: ceremony.id,
      },
    });
    if (!circuit) throw new Error("Missing circuit");

    const zkeyLocation = `${ceremony.id}/${circuit.id}/circuit_${sequenceNumber
      .toString()
      .padStart(4, "0")}.zkey`;
    const contributor = await prisma.contribution.create({
      data: {
        ceremonyId: params.id,
        circuitId,
        email,
        name,
        zkeyLocation,
        hash,
        sequenceNumber,
      },
    });

    const command = new PutObjectCommand({
      Bucket: "circuit-contributor",
      Key: zkeyLocation,
    });

    return NextResponse.json({
      contributor,
      uploadLink: await getSignedUrl(s3, command, { expiresIn: 3600 }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}

export async function GET(request: Request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const contributors = await prisma.contribution.findMany({
      where: {
        ceremonyId: params.id,
        circuitId: searchParams.get("circuitId") ?? undefined,
      },
      include: {
        circuit: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contributors);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}
