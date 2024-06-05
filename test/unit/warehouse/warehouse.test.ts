import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { WarehouseService } from "../../../src/warehouse/service/warehouse.service";
import { IWarehouseRepository } from "../../../src/warehouse/repository/warehouse.repository.interface";
import { IPickingRepository } from "../../../src/picking/repository/picking.repository.interface";
import { HttpService } from "@nestjs/axios";
import { WarehouseInput } from "../../../src/warehouse/input/warehouse.input";
import { MoveProductInput } from "../../../src/warehouse/input/move-product.input";
import { Order } from "../../../src/warehouse/input/order.input";
import { WarehouseDTO } from "../../../src/warehouse/dto/warehouse.dto";
import { ProductOrderDTO } from "../../../src/warehouse/dto/product-order.dto";
import { ProductWarehouseDTO } from "../../../src/warehouse/dto/product-warehouse.dto";
import { ProductToPickDto } from "../../../src/warehouse/dto/product-to-pick.dto";
import { of } from "rxjs";
import { ConfigModule } from "@nestjs/config";
import { StockGateway } from "../../../src/socket/socket.gateway";

describe('WarehouseService', () => {
  let service: WarehouseService;
  let warehouseRepository: jest.Mocked<IWarehouseRepository>;
  let pickingRepository: jest.Mocked<IPickingRepository>;
  beforeEach(async () => {
    const warehouseRepositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      moveProduct: jest.fn(),
      existsOrderRejected: jest.fn(),
      updateStock: jest.fn(),
      createOrderRejection: jest.fn(),
      getProductWarehouseByProviderId: jest.fn(),
    };
    const pickingRepositoryMock = {
      pickProduct: jest.fn(),
      existsOrder: jest.fn(),
      create: jest.fn(),
    };
    const httpServiceMock = {
      put: jest.fn().mockReturnValue(of({})),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        envFilePath: '.env',
      })],
      providers: [
        WarehouseService,
        { provide: IWarehouseRepository, useValue: warehouseRepositoryMock },
        { provide: IPickingRepository, useValue: pickingRepositoryMock },
        { provide: HttpService, useValue: httpServiceMock },
        StockGateway,
      ],
    }).compile();

    service = moduleRef.get<WarehouseService>(WarehouseService);
    warehouseRepository = moduleRef.get(IWarehouseRepository);
    pickingRepository = moduleRef.get(IPickingRepository);
  });

  it('should create a warehouse successfully', async () => {
    const warehouseInput: WarehouseInput = {
      address: "123 Main St",
      providerId: 1
    };
    const warehouseExample: WarehouseDTO = {
      id: 1,
      providerId: 1,
      address: "123 Main St",
      products: []
    };
    warehouseRepository.create.mockResolvedValue(warehouseExample);

    const result = await service.createWarehouse(warehouseInput);

    expect(result).toEqual(warehouseExample);
    expect(warehouseRepository.create).toHaveBeenCalledWith(warehouseInput);
  });

  it('should throw NotFoundException when warehouse not found by id', async () => {
    warehouseRepository.findById.mockResolvedValue(null);

    await expect(service.getWarehouseById(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when insufficient stock in warehouse', async () => {
    const moveProductInputExample: MoveProductInput = {
      providerId: 1,
      fromWarehouseId: 2,
      toWarehouseId: 3,
      quantity: 10
    };

    const validWarehouseData = {
      id: 2,
      providerId: 1,
      address: "123 Main St",
      products: [
        {
          wareHouseId: 2,
          productId: 1,
          stock: 5
        }
      ]
    };
    warehouseRepository.findById.mockResolvedValue(validWarehouseData);

    warehouseRepository.moveProduct.mockRejectedValue(new ConflictException());

    await expect(service.moveProduct(1, moveProductInputExample)).rejects.toThrow(ConflictException);
  });


  it('should throw UnauthorizedException when warehouses do not belong to the same provider', async () => {
    const moveProductInput: MoveProductInput = {
      providerId: 1,
      fromWarehouseId: 2,
      toWarehouseId: 3,
      quantity: 10
    };

    // Simulando que se encuentran almacenes válidos con diferentes proveedores
    const warehouse1Data = {
      id: 2,
      providerId: 1, // Proveedor 1
      address: "123 Main St",
      products: []
    };
    const warehouse2Data = {
      id: 3,
      providerId: 2, // Proveedor 2
      address: "456 Elm St",
      products: []
    };
    warehouseRepository.findById.mockResolvedValueOnce(warehouse1Data);
    warehouseRepository.findById.mockResolvedValueOnce(warehouse2Data);

    // Probando que la función moveProduct lance una UnauthorizedException
    await expect(service.moveProduct(1, moveProductInput)).rejects.toThrow(UnauthorizedException);
  });


  it('should handle order successfully', async () => {
    const order: Order = {
      id: 1,
      providerId: 1,
      address: "123 Main St",
      totalAmount: 100,
      products: [
        new ProductOrderDTO(1, 5),
        new ProductOrderDTO(2, 3)
      ]
    };
    const warehouses: ProductWarehouseDTO[] = [
      new ProductWarehouseDTO({ wareHouseId: 1, productId: 1, stock: 100 }),
      new ProductWarehouseDTO({ wareHouseId: 2, productId: 2, stock: 50 })
    ];
    pickingRepository.existsOrder.mockResolvedValue(false);
    warehouseRepository.existsOrderRejected.mockResolvedValue(false);
    warehouseRepository.getProductWarehouseByProviderId.mockResolvedValue(warehouses);

    warehouseRepository.
    updateStock.
    mockResolvedValue(new ProductWarehouseDTO({ wareHouseId: 1, productId: 1, stock:95 }))


    warehouseRepository.
    updateStock.
    mockResolvedValue(new ProductWarehouseDTO({ wareHouseId: 1, productId: 2, stock:47 }))

    await service.handleOrder(order);

    expect(pickingRepository.existsOrder).toHaveBeenCalledWith(order.id);
    expect(warehouseRepository.existsOrderRejected).toHaveBeenCalledWith(order.id);
    expect(warehouseRepository.getProductWarehouseByProviderId).toHaveBeenCalledWith(order.providerId);
    expect(warehouseRepository.updateStock).toHaveBeenCalledWith(1, 1, 95)
    expect(warehouseRepository.updateStock).toHaveBeenCalledWith(2, 2, 47)
    expect(pickingRepository.create).toHaveBeenCalledWith(order.id, [
      new ProductToPickDto(1, 5),
      new ProductToPickDto(2, 3)
    ]);
  });


  it('should throw ConflictException when order was already managed', async () => {
    const order: Order = {
      id: 1,
      providerId: 1,
      address: "123 Main St",
      totalAmount: 100,
      products: [
        new ProductOrderDTO(1, 5),
        new ProductOrderDTO(2, 3)
      ]
    };
    pickingRepository.existsOrder.mockResolvedValue(true);

    await expect(service.handleOrder(order)).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException when order was rejected before', async () => {
    const order: Order = {
      id: 1,
      providerId: 1,
      address: "123 Main St",
      totalAmount: 100,
      products: [
        new ProductOrderDTO(1, 5),
        new ProductOrderDTO(2, 3)
      ]
    };
    pickingRepository.existsOrder.mockResolvedValue(false);
    warehouseRepository.existsOrderRejected.mockResolvedValue(true);

    await expect(service.handleOrder(order)).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException when product not found in any warehouse', async () => {
    const order: Order = {
      id: 1,
      providerId: 1,
      address: "123 Main St",
      totalAmount: 100,
      products: [
        new ProductOrderDTO(3, 5), // Product with id 3 does not exist in any warehouse
        new ProductOrderDTO(2, 3)
      ]
    };
    const warehouses: ProductWarehouseDTO[] = [
      new ProductWarehouseDTO({ wareHouseId: 1, productId: 1, stock: 100 }),
      new ProductWarehouseDTO({ wareHouseId: 2, productId: 2, stock: 50 })
    ];
    pickingRepository.existsOrder.mockResolvedValue(false);
    warehouseRepository.existsOrderRejected.mockResolvedValue(false);
    warehouseRepository.getProductWarehouseByProviderId.mockResolvedValue(warehouses);

    await expect(service.handleOrder(order)).rejects.toThrow(ConflictException);
  });


});