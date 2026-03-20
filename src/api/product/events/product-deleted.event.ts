export class ProductDeletedEvent {
  constructor(
    public readonly productId: number,
    public readonly merchantId: number,
    public readonly deletedAt: Date,
  ) {} 
}