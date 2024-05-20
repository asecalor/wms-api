import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseController } from "./controller/warehouse.controller";
import { WarehouseService } from "./service/warehouse.service";
import { WarehouseRepository } from "./repository/warehouse.repository";
import { PickingRepository } from "../picking/repository/picking.repository";

@Module({
  imports: [PrismaModule],
  controllers: [WarehouseController],
  providers: [WarehouseService,WarehouseRepository,PickingRepository],
})
export class WarehouseModule {}
