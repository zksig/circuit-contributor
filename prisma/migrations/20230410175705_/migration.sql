-- CreateTable
CREATE TABLE `Contribution` (
    `id` VARCHAR(191) NOT NULL,
    `circuitId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `zkeyLocation` VARCHAR(191) NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `sequenceNumber` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Contribution_sequenceNumber_circuitId_key`(`sequenceNumber`, `circuitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
