/*
  Warnings:

  - Added the required column `managerEmail` to the `Ceremony` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Ceremony` ADD COLUMN `managerEmail` VARCHAR(191) NOT NULL;
