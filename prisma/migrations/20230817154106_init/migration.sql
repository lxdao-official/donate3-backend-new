/*
  Warnings:

  - You are about to drop the `Donate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Donate";

-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockHash" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "money" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "message" TEXT,
    "erc20" TEXT NOT NULL,
    "uid" TEXT,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);
