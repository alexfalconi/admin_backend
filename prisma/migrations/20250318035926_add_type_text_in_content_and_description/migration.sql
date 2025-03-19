-- AlterTable
ALTER TABLE `banners` MODIFY `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `news` MODIFY `title` VARCHAR(255) NOT NULL,
    MODIFY `description` TEXT NOT NULL,
    MODIFY `content` TEXT NOT NULL;
