/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Setting_address_key" ON "Setting"("address");
