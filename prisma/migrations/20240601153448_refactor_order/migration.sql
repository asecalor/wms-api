/*
  Warnings:

  - The primary key for the `OrderRejection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OrderRejection` table. All the data in the column will be lost.
  - You are about to drop the column `orderExecutionId` on the `Picking` table. All the data in the column will be lost.
  - You are about to drop the `OrderExecution` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orderId,productWareHouseId]` on the table `Picking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `Picking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Picking" DROP CONSTRAINT "Picking_orderExecutionId_fkey";

-- AlterTable
ALTER TABLE "OrderRejection" DROP CONSTRAINT "OrderRejection_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "OrderRejection_pkey" PRIMARY KEY ("orderId");

-- AlterTable
ALTER TABLE "Picking" DROP COLUMN "orderExecutionId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "OrderExecution";

-- CreateIndex
CREATE UNIQUE INDEX "Picking_orderId_productWareHouseId_key" ON "Picking"("orderId", "productWareHouseId");
