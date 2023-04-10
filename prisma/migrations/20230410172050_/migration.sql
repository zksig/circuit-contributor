/*
  Warnings:

  - You are about to drop the column `r1csLocation` on the `Circuit` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Circuit` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Circuit` DROP COLUMN `r1csLocation`,
    MODIFY `status` ENUM('SETUP', 'FAILED', 'COMPLETE') NOT NULL DEFAULT 'SETUP';
