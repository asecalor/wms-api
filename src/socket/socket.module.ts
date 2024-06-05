import { Module } from "@nestjs/common";
import { StockGateway } from "./socket.gateway";

@Module({
    providers: [StockGateway],
    exports: [StockGateway],
})
export class SocketModule {}