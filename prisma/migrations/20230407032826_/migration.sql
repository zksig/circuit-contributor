/*
  Warnings:

  - You are about to drop the column `endAt` on the `Ceremony` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `Ceremony` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `Ceremony` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Ceremony` DROP COLUMN `endAt`,
    DROP COLUMN `startAt`,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL;
