import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductToPickDto } from '../../warehouse/dto/product-to-pick.dto';

@Injectable()
export class PickingRepository {
  constructor(@Inject(PrismaService) private readonly db: PrismaService) {}

  async createPicking(
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
}
