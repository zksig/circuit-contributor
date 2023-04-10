import { prisma } from "@/services/prisma";
import { checkSession } from "@/services/privy";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
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
        managerEmail: email,
      },
    });
    if (!ceremony) throw new Error("Missing ceremony");

    const { name, maxConstraints } = await request.json();

    const id = crypto.randomUUID();
    const initialZKeyLocation = `${ceremony.id}/${id}/circuit_0000.zkey`;
    const circuit = await prisma.circuit.create({
      data: {
        id,
        name,
        maxConstraints,
        initialZKeyLocation,
        ceremonyId: params.id as string,
        ptauLocation:
          "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau",
      },
    });

    const command = new PutObjectCommand({
      Bucket: "circuit-contributor",
      Key: initialZKeyLocation,
    });

    return NextResponse.json({
      circuit,
      uploadLink: await getSignedUrl(s3, command, { expiresIn: 3600 }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}

export async function GET(request: Request, { params }) {
  try {
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
      },
    });
    if (!ceremony) throw new Error("Missing ceremony");

    const circuits = await prisma.circuit.findMany({
      where: {
        ceremonyId: params.id,
      },
    });

    return NextResponse.json(circuits);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}

export async function PATCH(request: Request, { params }) {
  try {
    const { email } = await checkSession(request);
    if (!email) {
      return NextResponse.redirect("/login");
    }

    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
        managerEmail: email,
      },
    });
    if (!ceremony) throw new Error("Missing ceremony");

    const { id, status, finalZKeyLocation } = await request.json();
    const circuit = await prisma.circuit.update({
      data: {
        status,
      },
      where: {
        id,
      },
    });

    return NextResponse.json(circuit);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}

export async function PUT(request: Request, { params }) {
  try {
    const { email } = await checkSession(request);
    if (!email) {
      return NextResponse.redirect("/login");
    }

    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
        managerEmail: email,
      },
    });
    if (!ceremony) throw new Error("Missing ceremony");

    const { circuitId } = await request.json();

    const finalZKeyLocation = `${ceremony.id}/${circuitId}/circuit_final.zkey`;
    const [circuit] = await Promise.all([
      prisma.circuit.update({
        data: {
          status: "COMPLETE",
          finalZKeyLocation,
        },
        where: {
          id: circuitId,
        },
      }),
      prisma.ceremony.update({
        data: {
          status: "COMPLETE",
        },
        where: {
          id: params.id,
        },
      }),
    ]);

    const command = new PutObjectCommand({
      Bucket: "circuit-contributor",
      Key: finalZKeyLocation,
    });

    return NextResponse.json({
      circuit,
      uploadLink: await getSignedUrl(s3, command, { expiresIn: 3600 }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message });
  }
}
