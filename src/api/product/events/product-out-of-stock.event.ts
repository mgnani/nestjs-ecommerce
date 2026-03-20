export class ProductOutOfStockEvent {
  constructor(
    public readonly productId: number,
    public readonly variationId: number,
    public readonly colorName: string,
    public readonly sizeCode: string,
  ) {} 
}