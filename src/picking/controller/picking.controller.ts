import { Body, Controller, HttpCode, Inject, Param, ParseIntPipe, Put } from "@nestjs/common";
import { ProductPicked } from "../dto/product-picked";
import { PickingService } from "../service/picking.service";

@Controller('picking')
export class PickingController{
  constructor(@Inject(PickingService) private readonly pickingService: PickingService){

  }
  @Put('/:orderExecutionId')
  @HttpCode(200)
  async updatePickProduct(@Param('orderExecutionId', ParseIntPipe) orderExecutionId: number,
                          @Body() productPicked: ProductPicked){
    return this.pickingService.updatePickProduct(orderExecutionId, productPicked.productWareHouseId)
  }
}