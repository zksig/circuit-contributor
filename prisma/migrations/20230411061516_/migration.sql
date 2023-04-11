-- CreateEnum
CREATE TYPE "CeremonyStatus" AS ENUM ('PREPARING', 'INVITING', 'PENDING', 'ON_GOING', 'COMPLETE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CircuitStatus" AS ENUM ('SETUP', 'FAILED', 'COMPLETE');

-- CreateTable
CREATE TABLE "Ceremony" (
    "id" TEXT NOT NULL,
    "managerEmail" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "CeremonyStatus" NOT NULL DEFAULT 'PREPARING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ceremony_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Circuit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CircuitStatus" NOT NULL DEFAULT 'SETUP',
    "ceremonyId" TEXT NOT NULL,
    "ptauLocation" TEXT NOT NULL,
    "maxConstraints" INTEGER NOT NULL,
    "initialZKeyLocation" TEXT,
    "finalZKeyLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Circuit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "ceremonyId" TEXT NOT NULL,
    "circuitId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zkeyLocation" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "ceremonyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_sequenceNumber_circuitId_key" ON "Contribution"("sequenceNumber", "circuitId");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_ceremonyId_email_key" ON "Contributor"("ceremonyId", "email");

-- AddForeignKey
ALTER TABLE "Circuit" ADD CONSTRAINT "Circuit_ceremonyId_fkey" FOREIGN KEY ("ceremonyId") REFERENCES "Ceremony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_ceremonyId_fkey" FOREIGN KEY ("ceremonyId") REFERENCES "Ceremony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_ceremonyId_fkey" FOREIGN KEY ("ceremonyId") REFERENCES "Ceremony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
