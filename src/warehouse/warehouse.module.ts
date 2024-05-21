import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseController } from './controller/warehouse.controller';
import { WarehouseService } from './service/warehouse.service';
import { WarehouseRepository } from './repository/warehouse.repository';
import { PickingRepository } from '../picking/repository/picking.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [WarehouseController],
  providers: [WarehouseService, WarehouseRepository, PickingRepository],
})
export class WarehouseModule {}
