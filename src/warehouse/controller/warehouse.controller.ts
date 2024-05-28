import {
  Body,
  Controller, Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query
} from "@nestjs/common";
import { ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IWarehouseService } from "../service/warehouse.service.interface";
import { WarehouseDTO } from "../dto/warehouse.dto";
import { WarehouseInput } from "../input/warehouse.input";
import { MoveProductInput } from "../input/move-product.input";
import { OrderUpdateDTO } from "../dto/order-update.dto";
import { OrderUpdate } from "../input/order-update.input";
import { Order } from "../input/order.input";

@Controller('warehouse')
@ApiTags('Warehouse')
export class WarehouseController {
  constructor(
    @Inject(IWarehouseService)
    private readonly warehouseService: IWarehouseService,
  ) { }

  @Get()
  @ApiResponse({ status: 200, type: [WarehouseDTO] })
  @ApiQuery({ name: 'providerId', required: false, type: Number })
  async getWarehouses(@Query('providerId', new ParseIntPipe({ optional: true })) providerId?: number): Promise<WarehouseDTO[]> {
    return this.warehouseService.getAllWarehouses(providerId);
  }

  @Post()
  @ApiResponse({ status: 201, type: WarehouseDTO })
  async createWarehouse(@Body() warehouse: WarehouseInput): Promise<WarehouseDTO> {
    return this.warehouseService.createWarehouse(warehouse);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: WarehouseDTO })
  async getWarehouseById(@Param('id', ParseIntPipe) id: number): Promise<WarehouseDTO> {
    return this.warehouseService.getWarehouseById(id);
  }

  @Post('/move/:productId')
  async moveProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() warehouse: MoveProductInput,
  ) {
    return this.warehouseService.moveProduct(productId, warehouse);
  }

  @Post('order')
  async handleOrder(@Body() order: Order) {
    await this.warehouseService.handleOrder(order);
  }

  @Put('order/:orderId')
  async updateOrderStatus(
    @Param('orderId', ParseIntPipe) clientId: number,
    @Body() orderStatus: OrderUpdate,
  ) {
    return this.warehouseService.updateOrderStatus(clientId, orderStatus.status);
  }

  @Get('not-delivered-orders')
  async getNotDeliveredOrders() {
    return this.warehouseService.getUndeliverableOrders()
  }
}
