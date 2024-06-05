import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WarehouseDTO } from '../dto/warehouse.dto';
import { IWarehouseRepository } from './warehouse.repository.interface';
import { WarehouseInput } from '../input/warehouse.input';
import { ProductWarehouseDTO } from '../dto/product-warehouse.dto';
import { NotDeliveredOrderDTO } from '../dto/not-delivered-order.dto';
import { ProductDTO } from '../dto/product.dto';

@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
  constructor(@Inject(PrismaService) private readonly db: PrismaService) {}

  async create(warehouse: WarehouseInput): Promise<WarehouseDTO> {
    const newWarehouse = await this.db.wareHouse.create({
      data: warehouse,
      include: {
        products: true,
      },
    });
    return new WarehouseDTO(newWarehouse);
  }

  async findAll(): Promise<WarehouseDTO[]> {
    const warehouses = await this.db.wareHouse.findMany({
      include: {
        products: true,
      },
    });
    return warehouses.map((warehouse) => new WarehouseDTO(warehouse));
  }

  async findById(id: number): Promise<WarehouseDTO> {
    const warehouse = await this.db.wareHouse.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
      },
    });
    if (!warehouse) {
      return null;
    }
    return new WarehouseDTO(warehouse);
  }

  async findByProviderId(providerId: number): Promise<WarehouseDTO[]> {
    const warehouses = await this.db.wareHouse.findMany({
      where: {
        providerId,
      },
      include: {
        products: true,
      },
    });
    return warehouses?.map((warehouse) => new WarehouseDTO(warehouse));
  }

  async moveProduct(
    productId: number,
    fromWarehouseId: number,
    toWarehouseId: number,
    quantity: number,
  ): Promise<void> {
    const productWareHouseFrom = await this.db.productWareHouse.findFirst({
      where: {
        productId: productId,
        wareHouseId: fromWarehouseId,
      },
    });

    await this.db.productWareHouse.update({
      where: {
        id: productWareHouseFrom.id,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    const productWareHouseDestination =
      await this.db.productWareHouse.findFirst({
        where: {
          productId: productId,
          wareHouseId: toWarehouseId,
        },
      });
    // If the product is not in the destination warehouse, create it
    if (!productWareHouseDestination) {
      await this.db.productWareHouse.create({
        data: {
          productId: productId,
          wareHouseId: toWarehouseId,
          stock: quantity,
        },
      });
    } else {
      // else update the stock
      await this.db.productWareHouse.update({
        where: {
          id: productWareHouseDestination.id,
        },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });
    }
  }

  async getProductWarehouseByProviderId(
    providerId: number,
  ): Promise<ProductWarehouseDTO[]> {
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
      (wareHouseProduct) => new ProductWarehouseDTO(wareHouseProduct),
    );
  }

  async existsOrderRejected(orderId: number): Promise<boolean> {
    const order = await this.db.orderRejection.findUnique({
      where: {
        orderId,
      },
    });
    return !!order;
  }

  async updateStock(warehouseId: number, productId: number, stock: number): Promise<ProductWarehouseDTO> {
    const productWarehouse = await this.db.productWareHouse.update({
      where: {
        wareHouseId_productId: {
          wareHouseId: warehouseId,
          productId: productId,
        },
      },
      data: {
        stock,
      }
    });

    return new ProductWarehouseDTO(productWarehouse);
  }

  async createOrderRejection(orderId: number) {
    return this.db.orderRejection.create({
      data: {
        orderId,
      },
    });
  }

  async getUndeliverableOrders(): Promise<NotDeliveredOrderDTO[]> {
    //Finds all orders that can't be delivered
    const orders = await this.db.picking.findMany({
      where: {
        picked: false,
      },
      select: {
        orderId: true,
        productWareHouseId: true,
        quantity: true,
        picked: true,
      },
      orderBy: {
        orderId: 'asc',
      },
    });
    const groupedOrders: { [key: string]: ProductDTO[] } = {};

    orders.forEach((order) => {
      if (!groupedOrders[order.orderId]) {
        groupedOrders[order.orderId] = [];
      }
      groupedOrders[order.orderId].push(new ProductDTO(order));
    });

    return Object.entries(groupedOrders).map(([orderId, products]) => {
      return new NotDeliveredOrderDTO(parseInt(orderId), products);
    });
  }
}
