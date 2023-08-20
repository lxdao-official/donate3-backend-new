-- CreateTable
CREATE TABLE "Donate" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockHash" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "money" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "message" TEXT,
    "erc20" TEXT NOT NULL,
    "uid" TEXT,

    CONSTRAINT "Donate_pkey" PRIMARY KEY ("id")
);
