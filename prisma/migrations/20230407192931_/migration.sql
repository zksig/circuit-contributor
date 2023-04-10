-- CreateTable
CREATE TABLE `Circuit` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('SETUP', 'FAILED', 'COMPLETE') NOT NULL,
    `ceremonyId` VARCHAR(191) NOT NULL,
    `ptauLocation` VARCHAR(191) NOT NULL,
    `maxConstraints` INTEGER NOT NULL,
    `r1csLocation` VARCHAR(191) NOT NULL,
    `initialZKeyLocation` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
