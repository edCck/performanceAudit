/*
  Warnings:

  - You are about to drop the column `bestPractices` on the `desktopperformancescore` table. All the data in the column will be lost.
  - You are about to drop the column `bestPractices` on the `mobileperformancescore` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - Added the required column `bestpractices` to the `DesktopPerformanceScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bestpractices` to the `MobilePerformanceScore` table without a default value. This is not possible if the table is not empty.
  - Made the column `pdfUrlMobile` on table `report` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pdfUrlDesktop` on table `report` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `DesktopPerformanceScore_reportId_fkey` ON `desktopperformancescore`;

-- DropIndex
DROP INDEX `MobilePerformanceScore_reportId_fkey` ON `mobileperformancescore`;

-- DropIndex
DROP INDEX `Report_userId_fkey` ON `report`;

-- AlterTable
ALTER TABLE `desktopperformancescore` DROP COLUMN `bestPractices`,
    ADD COLUMN `bestpractices` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `mobileperformancescore` DROP COLUMN `bestPractices`,
    ADD COLUMN `bestpractices` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `report` MODIFY `pdfUrlMobile` VARCHAR(191) NOT NULL,
    MODIFY `pdfUrlDesktop` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `password`;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DesktopPerformanceScore` ADD CONSTRAINT `DesktopPerformanceScore_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MobilePerformanceScore` ADD CONSTRAINT `MobilePerformanceScore_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
