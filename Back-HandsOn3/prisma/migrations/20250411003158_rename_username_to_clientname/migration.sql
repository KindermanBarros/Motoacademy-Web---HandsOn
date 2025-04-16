/*
  Warnings:

  - You are about to drop the column `clientId` on the `serviceorder` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `serviceorder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ServiceOrder` DROP FOREIGN KEY `ServiceOrder_clientId_fkey`;

-- DropIndex
DROP INDEX `ServiceOrder_clientId_fkey` ON `ServiceOrder`;

-- AlterTable
ALTER TABLE `ServiceOrder` DROP COLUMN `clientId`,
    DROP COLUMN `userName`,
    ADD COLUMN `clientName` VARCHAR(191) NULL,
    ADD COLUMN `clientid` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ServiceOrder` ADD CONSTRAINT `ServiceOrder_clientid_fkey` FOREIGN KEY (`clientid`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
