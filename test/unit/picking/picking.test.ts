import { Test } from '@nestjs/testing';
import { PickingService } from "../../../src/picking/service/picking.service";
import { IPickingRepository } from "../../../src/picking/repository/picking.repository.interface";
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";

describe('PickingService', () => {
  let service: PickingService;
  let pickingRepository: jest.Mocked<IPickingRepository>;

  beforeEach(async () => {
    const pickingRepositoryMock = {
      pickProduct: jest.fn(),
      existsOrder: jest.fn(),
      create: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        envFilePath: '.env',
      })],
      providers: [
        PickingService,
        { provide: IPickingRepository, useValue: pickingRepositoryMock },
      ],
    }).compile();

    service = moduleRef.get<PickingService>(PickingService);
    pickingRepository = moduleRef.get(IPickingRepository);
  });

  it('should pick a product successfully', async () => {
    const orderId = 1;
    const productWareHouseId = 1;
    pickingRepository.pickProduct.mockResolvedValue(true);

    await service.pickProduct(orderId, productWareHouseId);

    expect(pickingRepository.pickProduct).toHaveBeenCalledWith(orderId, productWareHouseId);
  });

  it('should throw NotFoundException when product not found in order', async () => {
    const orderId = 1;
    const productWareHouseId = 1;
    pickingRepository.pickProduct.mockResolvedValue(false);

    await expect(service.pickProduct(orderId, productWareHouseId)).rejects.toThrow(NotFoundException);
  });
});