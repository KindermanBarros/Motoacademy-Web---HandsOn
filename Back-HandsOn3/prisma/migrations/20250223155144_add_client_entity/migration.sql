-- AlterTable
ALTER TABLE `serviceorder` ADD COLUMN `clientid` INTEGER NULL;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceOrder` ADD CONSTRAINT `ServiceOrder_clientid_fkey` FOREIGN KEY (`clientid`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
