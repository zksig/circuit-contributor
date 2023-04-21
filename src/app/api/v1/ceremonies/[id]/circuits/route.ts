import { prisma } from "@/services/prisma";
import { checkSession } from "@/services/privy";
import HttpError from "@/utils/HttpError";
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
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
        managerEmail: email,
      },
    });
    if (!ceremony) throw new HttpError("Missing ceremony", 404);

    const { name, maxConstraints } = await request.json();

    const id = crypto.randomUUID();
    const r1csLocation = `${ceremony.id}/${id}/circuit.r1cs`;
    const wasmLocation = `${ceremony.id}/${id}/circuit.wasm`;
    const initialZKeyLocation = `${ceremony.id}/${id}/circuit_0000.zkey`;
    const circuit = await prisma.circuit.create({
      data: {
        id,
        name,
        maxConstraints,
        r1csLocation,
        wasmLocation,
        initialZKeyLocation,
        ceremonyId: params.id as string,
        ptauLocation:
          "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau",
      },
    });

    const r1csCommand = new PutObjectCommand({
      Bucket: "circuit-contributor",
      Key: r1csLocation,
    });
    const wasmCommand = new PutObjectCommand({
      Bucket: "circuit-contributor",
      Key: wasmLocation,
    });
    const zkeyCommand = new PutObjectCommand({
      Bucket: "circuit-contributor",
      Key: initialZKeyLocation,
    });

    return NextResponse.json({
      circuit,
      r1csUploadLink: await getSignedUrl(s3, r1csCommand, { expiresIn: 3600 }),
      wasmUploadLink: await getSignedUrl(s3, wasmCommand, { expiresIn: 3600 }),
      zkeyUploadLink: await getSignedUrl(s3, zkeyCommand, { expiresIn: 3600 }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

export async function GET(request: Request, { params }) {
  try {
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
      },
    });
    if (!ceremony) throw new HttpError("Missing ceremony", 404);

    const circuits = await prisma.circuit.findMany({
      where: {
        ceremonyId: params.id,
      },
    });

    return NextResponse.json(circuits);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

export async function PATCH(request: Request, { params }) {
  try {
    const { email } = await checkSession(request);
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
        managerEmail: email,
      },
    });
    if (!ceremony) throw new HttpError("Missing ceremony", 404);

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
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

export async function PUT(request: Request, { params }) {
  try {
    const { email } = await checkSession(request);
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        id: params.id,
        managerEmail: email,
      },
    });
    if (!ceremony) throw new HttpError("Missing ceremony", 404);

    const { circuitId } = await request.json();

    const zkeyLocation = `${ceremony.id}/${circuitId}/circuit_final.zkey`;
    const vkeyLocation = `${ceremony.id}/${circuitId}/circuit_vkey.json`;
    const [circuit] = await Promise.all([
      prisma.circuit.update({
        data: {
          status: "COMPLETE",
          zkeyLocation,
          vkeyLocation,
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

    const zkeyCommand = new PutObjectCommand({
      Bucket: "circuit-contributor",
      Key: zkeyLocation,
    });
    const vkeyCommand = new PutObjectCommand({
      Bucket: "circuit-contributor",
      Key: vkeyLocation,
    });

    return NextResponse.json({
      circuit,
      zkeyUploadLink: await getSignedUrl(s3, zkeyCommand, { expiresIn: 3600 }),
      vkeyUploadLink: await getSignedUrl(s3, vkeyCommand, { expiresIn: 3600 }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
