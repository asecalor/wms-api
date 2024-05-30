import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WarehouseDTO } from "../dto/warehouse.dto";
import { IWarehouseRepository } from "./warehouse.repository.interface";
import { WarehouseInput } from "../input/warehouse.input";
import { ProductWarehouseDTO } from "../dto/product-warehouse.dto";

@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
  constructor(@Inject(PrismaService) private readonly db: PrismaService) { }

  async create(warehouse: WarehouseInput): Promise<WarehouseDTO> {
    const newWarehouse = await this.db.wareHouse.create({
      data: warehouse,
      include: {
        products: true,
      }
    });
    return new WarehouseDTO(newWarehouse);
  }

  async findAll(): Promise<WarehouseDTO[]> {
    const warehouses = await this.db.wareHouse.findMany({
      include: {
        products: true,
      }
    });
    return warehouses.map(warehouse => new WarehouseDTO(warehouse));
  }

  async findById(id: number): Promise<WarehouseDTO> {
    const warehouse = await this.db.wareHouse.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
      }
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
      }
    });
    return warehouses?.map(warehouse => new WarehouseDTO(warehouse));
  }

  async moveProduct(productId: number, fromWarehouseId: number, toWarehouseId: number, quantity: number): Promise<void> {
    const productWareHouseFrom = await this.db.productWareHouse.findFirst({
      where: {
        productId: productId,
        wareHouseId: fromWarehouseId,
      }
    })

    await this.db.productWareHouse.update({
      where: {
        id: productWareHouseFrom.id,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      }
    })

    const productWareHouseDestination = await this.db.productWareHouse.findFirst({
      where: {
        productId: productId,
        wareHouseId: toWarehouseId,
      }
    })
    // If the product is not in the destination warehouse, create it
    if (!productWareHouseDestination) {
      await this.db.productWareHouse.create({
        data: {
          productId: productId,
          wareHouseId: toWarehouseId,
          stock: quantity,
        }
      })
    }
    else {
      // else update the stock
      await this.db.productWareHouse.update({
        where: {
          id: productWareHouseDestination.id
        },
        data: {
          stock: {
            increment: quantity,
          },
        }
      })
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
      (wareHouseProduct) =>
        new ProductWarehouseDTO(wareHouseProduct),
    );
  }
  async existsOrderExecuted(orderId: number): Promise<boolean> {
    const order = await this.db.orderExecution.findUnique({
      where: {
        orderId,
      },
    });
    return !!order;
  }

  async existsOrderRejected(orderId: number): Promise<boolean> {
    const order = await this.db.orderRejection.findUnique({
      where: {
        orderId,
      },
    });
    return !!order;
  }

  async createOrderExecution(orderId: number) {
    return this.db.orderExecution.create({
      data: {
        orderId,
      },
    });
  }

  async updateStock(warehouseId:number,productId:number,stock: number) {
    await this.db.productWareHouse.update({
      where: {
       wareHouseId_productId: {
            wareHouseId: warehouseId,
            productId: productId,
          },
      },
      data: {
        stock
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

  async getUndeliverableOrders() {
    //Finds all orders that can't be delivered
    return this.db.orderExecution.findMany({
      where: {
        canDeliver: false,
      },
      select: {
        id: true,
        orderId: true,
        picking: {
          select: {
            productWareHouseId: true,
            quantity: true,
            picked: true,
          },
        },
      },
    });
  }
}
