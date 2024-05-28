import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductToPickDto } from '../../warehouse/dto/product-to-pick.dto';
import { IPickingRepository } from './picking.repository.interface';

@Injectable()
export class PickingRepository implements IPickingRepository{
  constructor(@Inject(PrismaService) private readonly db: PrismaService) {}

  async create(
    orderExecutionId: number,
    productsToPickDto: ProductToPickDto[],
  ) {
    await this.db.picking.createMany({
      data: productsToPickDto.map((p) => ({
        orderExecutionId: orderExecutionId,
        productWareHouseId: p.productWareHouseId,
        picked: false,
        quantity: p.quantity,
      })),
    });
  }

  async pickProduct(orderExecutionId: number, productWareHouseId: number) :Promise<boolean> {
    const picking = await this.db.picking.findFirst({
      where: {
        orderExecutionId: orderExecutionId,
        productWareHouseId: productWareHouseId,
      },
    });
    if (!picking) {
      return false
    }

    await this.db.picking.update({
      where: {
        id: picking.id,  // Usamos el ID único del registro encontrado
      },
      data: {
        picked: true,
      },
    });
    return true
  }
}
