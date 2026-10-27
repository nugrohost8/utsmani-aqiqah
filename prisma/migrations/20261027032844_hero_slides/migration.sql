-- CreateTable
CREATE TABLE `HeroSlide` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eyebrow` VARCHAR(191) NULL,
    `title` TEXT NOT NULL,
    `subtitle` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `primaryLabel` VARCHAR(191) NULL,
    `primaryUrl` VARCHAR(191) NULL,
    `secondaryLabel` VARCHAR(191) NULL,
    `secondaryUrl` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
