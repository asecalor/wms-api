import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productProviderData = generateProductProviderData();

  for (const data of productProviderData) {
    const { productId, providerId } = data;


    // Verificar si el proveedor ya tiene almacenes
    const warehouses = await prisma.wareHouse.findMany({
      where: { providerId },
    });

    let warehouse1, warehouse2;

    if (warehouses.length === 0) {
      // Si el proveedor no tiene almacenes, crear dos almacenes nuevos
      warehouse1 = await prisma.wareHouse.create({
        data: {
          providerId: providerId,
          address: `Address 1, City ${providerId}, Country ${providerId}`,
        },
      });

      warehouse2 = await prisma.wareHouse.create({
        data: {
          providerId: providerId,
          address: `Address 2, City ${providerId}, Country ${providerId}`,
        },
      });
    } else {
      // Si el proveedor ya tiene almacenes, seleccionar los dos primeros
      [warehouse1, warehouse2] = warehouses.slice(0, 2);
    }

    // Crear entradas en la tabla ProductWareHouse para cada almacén
    await prisma.productWareHouse.createMany({
      data: [
        { productId, wareHouseId: warehouse1.id, stock: 15 },
        { productId, wareHouseId: warehouse2.id, stock: 15 },
      ],
    });
  }
}

function generateProductProviderData() {
  const data = [];
  for (let i = 1; i <= 50; i++) {
    const providerId = Math.ceil(i / 5); // Distribuir los productos entre 10 proveedores
    data.push({
      productId: i,
      providerId,
    });
  }
  return data;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
