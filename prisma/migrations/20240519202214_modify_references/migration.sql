/*
  Warnings:

  - The primary key for the `ProductWareHouse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[wareHouseId,productId]` on the table `ProductWareHouse` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductWareHouse" DROP CONSTRAINT "ProductWareHouse_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ProductWareHouse_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductWareHouse_wareHouseId_productId_key" ON "ProductWareHouse"("wareHouseId", "productId");

-- AddForeignKey
ALTER TABLE "Picking" ADD CONSTRAINT "Picking_productWareHouseId_fkey" FOREIGN KEY ("productWareHouseId") REFERENCES "ProductWareHouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Picking" ADD CONSTRAINT "Picking_orderExecutionId_fkey" FOREIGN KEY ("orderExecutionId") REFERENCES "OrderExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
