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
    "amount" TEXT,
    "price" TEXT,
    "decimals" INTEGER,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
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

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
