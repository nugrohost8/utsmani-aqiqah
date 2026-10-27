-- AlterTable
ALTER TABLE `Order` ADD COLUMN `assignedAt` DATETIME(3) NULL,
    ADD COLUMN `crmId` INTEGER NULL,
    ADD COLUMN `status` ENUM('BARU', 'DIPROSES', 'SELESAI', 'BATAL') NOT NULL DEFAULT 'BARU';

-- CreateTable
CREATE TABLE `Crm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WaMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `direction` ENUM('IN', 'OUT') NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `purpose` VARCHAR(40) NOT NULL,
    `orderId` INTEGER NULL,
    `ok` BOOLEAN NOT NULL DEFAULT true,
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WaMessage_number_createdAt_idx`(`number`, `createdAt`),
    INDEX `WaMessage_orderId_idx`(`orderId`),
    INDEX `WaMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_phone_idx` ON `Order`(`phone`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_crmId_fkey` FOREIGN KEY (`crmId`) REFERENCES `Crm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WaMessage` ADD CONSTRAINT `WaMessage_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


-- Normalisasi nomor HP pesanan lama ke format 62… agar bisa dicocokkan dengan pesan masuk
UPDATE `Order` SET `phone` = SUBSTRING(`phone`, 2) WHERE `phone` LIKE '+62%';
UPDATE `Order` SET `phone` = CONCAT('62', SUBSTRING(`phone`, 2)) WHERE `phone` LIKE '08%';
