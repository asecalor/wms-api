-- CreateTable
CREATE TABLE "OrderExecution" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "canDeliver" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WareHouse" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "WareHouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductWareHouse" (
    "wareHouseId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "ProductWareHouse_pkey" PRIMARY KEY ("wareHouseId","productId")
);

-- CreateTable
CREATE TABLE "Picking" (
    "id" SERIAL NOT NULL,
    "orderExecutionId" INTEGER NOT NULL,
    "productWareHouseId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "picked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Picking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderExecution_orderId_key" ON "OrderExecution"("orderId");

-- AddForeignKey
ALTER TABLE "ProductWareHouse" ADD CONSTRAINT "ProductWareHouse_wareHouseId_fkey" FOREIGN KEY ("wareHouseId") REFERENCES "WareHouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
