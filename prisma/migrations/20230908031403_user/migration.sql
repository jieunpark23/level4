/*
  Warnings:

  - You are about to drop the column `content` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Posts` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Posts` table. All the data in the column will be lost.
  - Added the required column `PostId` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `comment` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Comments` DROP COLUMN `content`,
    DROP COLUMN `password`,
    DROP COLUMN `postId`,
    DROP COLUMN `user`,
    ADD COLUMN `PostId` INTEGER NOT NULL,
    ADD COLUMN `UserId` INTEGER NOT NULL,
    ADD COLUMN `comment` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Posts` DROP COLUMN `password`,
    DROP COLUMN `user`,
    ADD COLUMN `UserId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_nickname_key`(`nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comments` ADD CONSTRAINT `Comments_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comments` ADD CONSTRAINT `Comments_PostId_fkey` FOREIGN KEY (`PostId`) REFERENCES `Posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
