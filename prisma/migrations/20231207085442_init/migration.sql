/*
  Warnings:

  - You are about to drop the `Setting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Setting";

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "type" INTEGER,
    "color" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "description" TEXT,
    "twitter" TEXT,
    "telegram" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_address_key" ON "Settings"("address");
