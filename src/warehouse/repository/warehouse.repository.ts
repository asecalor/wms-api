import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductWarehouseDto } from '../dto/product-warehouse.dto';

@Injectable()
export class WarehouseRepository {
  constructor(@Inject(PrismaService) private readonly db: PrismaService) {}

  async getProductWarehouseByProviderId(
    providerId: number,
  ): Promise<ProductWarehouseDto[]> {
    const wareHouses = await this.db.wareHouse.findMany({
      where: {
        providerId,
      },
    });
    const wareHouseIds = wareHouses.map((wareHouse) => wareHouse.id);
    const wareHouseProduct = await this.db.productWareHouse.findMany({
      where: {
        wareHouseId: {
          in: wareHouseIds,
        },
      },
    });
    return wareHouseProduct.map(
      (wareHouseProduct) =>
        new ProductWarehouseDto(
          wareHouseProduct.id,
          wareHouseProduct.wareHouseId,
          wareHouseProduct.productId,
          wareHouseProduct.stock,
        ),
    );
  }
  async existsOrderExecuted(orderId: number): Promise<boolean> {
    const order = await this.db.orderExecution.findUnique({
      where: {
        orderId,
      },
    });
    return !order;
  }

  async existsOrderRejected(orderId: number): Promise<boolean> {
    const order = await this.db.orderRejection.findUnique({
      where: {
        orderId,
      },
    });
    return !order;
  }

  async createOrderExecution(orderId: number) {
    return this.db.orderExecution.create({
      data: {
        orderId,
      },
    });
  }
  async updateStock(productWareHouseId: number, quantity: number) {
    return this.db.productWareHouse.update({
      where: {
        id: productWareHouseId,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  async createOrderRejection(orderId: number) {
    return this.db.orderRejection.create({
      data: {
        orderId,
      },
    });
  }
}
