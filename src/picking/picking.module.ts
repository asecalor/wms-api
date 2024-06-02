import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PickingRepository } from './repository/picking.repository';
import { IPickingRepository } from './repository/picking.repository.interface';
import { IPickingService } from './service/picking.service.interface';
import { PickingService } from './service/picking.service';
import { PickingController } from './controller/picking.controller';

export const PickingRepositoryProvider = {
  provide: IPickingRepository,
  useClass: PickingRepository,
};

export const PickingServiceProvider = {
  provide: IPickingService,
  useClass: PickingService,
};

@Module({
  imports: [PrismaModule],
  controllers: [PickingController],
  providers: [PickingRepositoryProvider, PickingServiceProvider],
})
export class PickingModule {}
