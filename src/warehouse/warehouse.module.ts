import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseController } from './controller/warehouse.controller';
import { WarehouseService } from './service/warehouse.service';
import { WarehouseRepository } from './repository/warehouse.repository';
import { PickingRepository } from '../picking/repository/picking.repository';
import { HttpModule } from '@nestjs/axios';
import { IWarehouseService } from './service/warehouse.service.interface';
import { IWarehouseRepository } from './repository/warehouse.repository.interface';
import { PickingRepositoryProvider } from 'src/picking/picking.module';
import { ConfigModule } from "@nestjs/config";
import { SocketModule } from 'src/socket/socket.module';

export const warehouseServiceProvider = {
  provide: IWarehouseService,
  useClass: WarehouseService,
};

export const warehouseRepositoryProvider = {
  provide: IWarehouseRepository,
  useClass: WarehouseRepository,
};

@Module({
  imports: [PrismaModule, HttpModule, ConfigModule, SocketModule],
  controllers: [WarehouseController],
  providers: [
    warehouseServiceProvider,
    warehouseRepositoryProvider,
    PickingRepositoryProvider,
  ],
})
export class WarehouseModule {}
