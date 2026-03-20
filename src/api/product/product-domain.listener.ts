import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductOutOfStockEvent } from './events/product-out-of-stock.event';
import { ProductDeletedEvent } from './events/product-deleted.event';

@Injectable()
export class ProductDomainListener {
  private readonly logger = new Logger(ProductDomainListener.name);

  @OnEvent('product.out_of_stock')
  handleOutOfStock(event: ProductOutOfStockEvent) {
    this.logger.warn(
      `🚨 ALERTA DE INVENTARIO: El producto ID ${event.productId} se quedó sin stock ` +
      `para la variante (Color: ${event.colorName}, Talle: ${event.sizeCode}). ` +
      `Se requiere reabastecimiento urgente.`
    );
  }

  @OnEvent('product.deleted')
  handleProductDeleted(event: ProductDeletedEvent) {
    this.logger.error(
      `🗑️ AUDITORÍA: El Mercader con ID ${event.merchantId} eliminó permanentemente ` +
      `el producto ID ${event.productId} a las ${event.deletedAt.toISOString()}.`
    );
  }
}