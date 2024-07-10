/*
  Warnings:

  - You are about to drop the column `pdfUrlDesktop` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrlMobile` on the `report` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `DesktopPerformanceScore_reportId_fkey` ON `desktopperformancescore`;

-- DropIndex
DROP INDEX `MobilePerformanceScore_reportId_fkey` ON `mobileperformancescore`;

-- DropIndex
DROP INDEX `Report_userId_fkey` ON `report`;

-- AlterTable
ALTER TABLE `report` DROP COLUMN `pdfUrlDesktop`,
    DROP COLUMN `pdfUrlMobile`;

-- CreateTable
CREATE TABLE `Pdf` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `pdfUrlMobile` VARCHAR(191) NOT NULL,
    `pdfUrlDesktop` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pdf` ADD CONSTRAINT `Pdf_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DesktopPerformanceScore` ADD CONSTRAINT `DesktopPerformanceScore_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MobilePerformanceScore` ADD CONSTRAINT `MobilePerformanceScore_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
