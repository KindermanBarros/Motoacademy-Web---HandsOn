/*
  Warnings:

  - You are about to drop the column `clientid` on the `serviceorder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ServiceOrder` DROP FOREIGN KEY `ServiceOrder_clientid_fkey`;

-- DropIndex
DROP INDEX `ServiceOrder_clientid_fkey` ON `ServiceOrder`;

-- AlterTable
ALTER TABLE `ServiceOrder` DROP COLUMN `clientid`,
    ADD COLUMN `clientId` INTEGER NULL,
    ADD COLUMN `userName` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ServiceOrder` ADD CONSTRAINT `ServiceOrder_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
