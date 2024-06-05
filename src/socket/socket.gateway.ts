import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { ProductWarehouseDTO } from "src/warehouse/dto/product-warehouse.dto";

@WebSocketGateway()
export class StockGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    // every time a client connects to the server, the handleConnection method is called
    handleConnection(client: any, ...args: any[]) {
        console.log('Client connected');
    }
    // every time a client disconnects from the server, the handleDisconnect method is called
    handleDisconnect(client: any) {
        console.log('Client disconnected');
    }
    // the emitStockAlert method is responsible for sending a message to the client through stock event
    emitStockAlert(productWarehouse: ProductWarehouseDTO) {
        this.server.emit('stock', { message: `Queda poco stock del producto ${productWarehouse.productId} en el inventario ${productWarehouse.wareHouseId}! Stock restante: ${productWarehouse.stock}` });
    }
}