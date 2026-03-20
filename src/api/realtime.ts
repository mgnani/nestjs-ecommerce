import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';
import { ProductOutOfStockEvent } from './product/events/product-out-of-stock.event';
import { ProductDeletedEvent } from './product/events/product-deleted.event';

@Controller('realtime')
export class RealtimeController {
  private notify$ = new Subject<MessageEvent>();

  @Sse('events')
  sendEvents(): Observable<MessageEvent> {
    return this.notify$.asObservable();
  }

  @OnEvent('product.out_of_stock')
  handleOutOfStock(payload: ProductOutOfStockEvent) {
    console.log('📢 BACKEND AVISANDO STOCK CERO:', payload);
    this.notify$.next({ 
      data: { type: 'OUT_OF_STOCK', payload: payload } 
    });
  }

  @OnEvent('product.created')
  handleProductCreated(payload: any) {
    console.log('📢 BACKEND AVISANDO PRODUCTO NUEVO:', payload);
    this.notify$.next({ 
      data: { type: 'NEW_PRODUCT', payload: payload } 
    });
  }

  @OnEvent('product.deleted')
  handleProductDeleted(payload: ProductDeletedEvent) {
    console.log('📢 BACKEND AVISANDO PRODUCTO BORRADO:', payload);
    this.notify$.next({ 
      data: { type: 'PRODUCT_DELETED', payload: payload } 
    });
  }
}