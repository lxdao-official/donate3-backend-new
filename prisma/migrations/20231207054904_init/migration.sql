/*
  Warnings:

  - You are about to drop the column `color` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `telegram` on the `Setting` table. All the data in the column will be lost.
  - Added the required column `setting` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "color",
DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "telegram",
ADD COLUMN     "setting" TEXT NOT NULL;
