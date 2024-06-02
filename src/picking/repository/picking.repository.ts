import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductToPickDto } from '../../warehouse/dto/product-to-pick.dto';
import { IPickingRepository } from './picking.repository.interface';

@Injectable()
export class PickingRepository implements IPickingRepository {
  constructor(@Inject(PrismaService) private readonly db: PrismaService) {}

  async create(orderId: number, productsToPickDto: ProductToPickDto[]) {
    await this.db.picking.createMany({
      data: productsToPickDto.map((p) => ({
        orderId,
        productWareHouseId: p.productWareHouseId,
        picked: false,
        quantity: p.quantity,
      })),
    });
  }

  async existsOrder(orderId: number): Promise<boolean> {
    const order = await this.db.picking.findFirst({
      where: {
        orderId,
      },
    });
    return !!order;
  }

  async pickProduct(
    orderId: number,
    productWareHouseId: number,
  ): Promise<boolean> {
    const picking = await this.db.picking.findFirst({
      where: {
        orderId,
        productWareHouseId: productWareHouseId,
      },
    });
    if (!picking) {
      return false;
    }

    await this.db.picking.update({
      where: {
        id: picking.id, // Usamos el ID único del registro encontrado
      },
      data: {
        picked: true,
      },
    });
    return true;
  }
}
