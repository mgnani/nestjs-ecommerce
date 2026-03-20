import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateProductDto } from '../dto/product.dto';
import { Category } from '../../../database/entities/category.entity';
import { Product } from 'src/database/entities/product.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { ProductVariationPrice } from 'src/database/entities/productVariation_price.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { errorMessages } from 'src/errors/custom';
import { ProductOutOfStockEvent } from '../events/product-out-of-stock.event';
import { ProductDeletedEvent } from '../events/product-deleted.event';

@Injectable()
export class ProductService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll() {
    return this.entityManager.find(Product, {
      relations: [
        'category',
        'merchant',
        'variations',
        'variations.inventory',
        'variations.prices',
      ],
    });
  }

  async getProduct(productId: number) {
    const product = await this.entityManager.findOne(Product, {
      where: { id: productId },
      relations: [
        'category',
        'merchant',
        'variations',
        'variations.inventory',
        'variations.prices',
      ],
    });

    if (!product) throw new NotFoundException(errorMessages.product.notFound);
    return product;
  }

  async createProduct(data: CreateProductDto, merchantId: number) {
    const newProductId = await this.entityManager.transaction(async (tm) => {
      const category = await tm.findOne(Category, { where: { id: data.categoryId } });
      if (!category) throw new NotFoundException(errorMessages.category.notFound);

      const product = tm.create(Product, {
        title: data.title,
        code: data.code,
        description: data.description,
        variationType: data.variationType,
        details: data.details,
        about: data.about,
        categoryId: category.id,
        merchantId,
        isActive: true,
      });
      const savedProduct = await tm.save(product);

      for (const v of data.variations) {
        const variation = tm.create(ProductVariation, {
          productId: savedProduct.id,
          colorName: v.colorName,
          sizeCode: v.sizeCode,
          imageUrls: [v.image],
        });
        const savedVariation = await tm.save(variation);

        const priceEntry = tm.create(ProductVariationPrice, {
          productVariationId: savedVariation.id,
          countryCode: v.countryCode,
          currencyCode: v.currencyCode,
          price: v.price,
        });
        await tm.save(priceEntry);

        const inventoryEntry = tm.create(Inventory, {
          productVariationId: savedVariation.id,
          countryCode: v.countryCode,
          quantity: v.quantity,
        });
        await tm.save(inventoryEntry);
      }

      return savedProduct.id;
    });

    this.eventEmitter.emit('product.created', { productId: newProductId, title: data.title });

    return this.getProduct(newProductId);
  }

  async updateProduct(productId: number, data: CreateProductDto, merchantId: number) {
    const outOfStockEvents: ProductOutOfStockEvent[] = [];

    await this.entityManager.transaction(async (tm) => {
      const product = await tm.findOne(Product, {
        where: { id: productId, merchantId },
        relations: ['variations'],
      });

      if (!product) throw new NotFoundException(errorMessages.product.notFound);

      const category = await tm.findOne(Category, { where: { id: data.categoryId } });
      if (!category) throw new NotFoundException(errorMessages.category.notFound);

      product.title = data.title;
      product.code = data.code;
      product.description = data.description;
      product.variationType = data.variationType;
      product.details = data.details;
      product.about = data.about;
      product.categoryId = category.id;

      await tm.save(product);

      if (product.variations && product.variations.length > 0) {
        const variationIds = product.variations.map((v) => v.id);

        await tm.delete(Inventory, { productVariationId: In(variationIds) });
        await tm.delete(ProductVariationPrice, { productVariationId: In(variationIds) });
        await tm.delete(ProductVariation, { id: In(variationIds) });
      }

      for (const v of data.variations) {
        const variation = tm.create(ProductVariation, {
          productId: product.id,
          colorName: v.colorName,
          sizeCode: v.sizeCode,
          imageUrls: [v.image],
        });
        const savedVariation = await tm.save(variation);

        const priceEntry = tm.create(ProductVariationPrice, {
          productVariationId: savedVariation.id,
          countryCode: v.countryCode,
          currencyCode: v.currencyCode,
          price: v.price,
        });
        await tm.save(priceEntry);

        const inventoryEntry = tm.create(Inventory, {
          productVariationId: savedVariation.id,
          countryCode: v.countryCode,
          quantity: v.quantity,
        });
        await tm.save(inventoryEntry);

        // 2. Anotamos el evento, pero TODAVÍA NO GRITAMOS
        if (Number(v.quantity) === 0) {
          outOfStockEvents.push(
            new ProductOutOfStockEvent(productId, savedVariation.id, v.colorName, v.sizeCode)
          );
        }
      }
    });

    for (const event of outOfStockEvents) {
      this.eventEmitter.emit('product.out_of_stock', event);
    }

    return this.getProduct(productId);
  }

  async deleteProduct(productId: number, merchantId: number) {
    await this.entityManager.transaction(async (tm) => {
      const product = await tm.findOne(Product, {
        where: { id: productId, merchantId },
        relations: ['variations'],
      });

      if (!product) throw new NotFoundException(errorMessages.product.notFound);

      if (product.variations && product.variations.length > 0) {
        const variationIds = product.variations.map((v) => v.id);

        await tm.delete(Inventory, { productVariationId: In(variationIds) });
        await tm.delete(ProductVariationPrice, { productVariationId: In(variationIds) });
        await tm.delete(ProductVariation, { id: In(variationIds) });
      }

      await tm.delete(Product, { id: productId });
    });

    this.eventEmitter.emit(
      'product.deleted',
      new ProductDeletedEvent(productId, merchantId, new Date()),
    );

    return { success: true };
  }
}