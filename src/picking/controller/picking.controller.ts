import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ProductPicked } from '../dto/product-picked';
import { ApiTags } from '@nestjs/swagger';
import { IPickingService } from '../service/picking.service.interface';

@Controller('picking')
@ApiTags('Picking')
export class PickingController {
  constructor(
    @Inject(IPickingService) private readonly pickingService: IPickingService,
  ) {}
  @Put('/:orderId')
  @HttpCode(200)
  async updatePickProduct(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() productPicked: ProductPicked,
  ) {
    return this.pickingService.pickProduct(
      orderId,
      productPicked.productWareHouseId,
    );
  }
}
