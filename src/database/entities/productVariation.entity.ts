import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Color } from './color.entity';
import { Product } from './product.entity';
import { Size } from './size.entity';
import { Inventory } from './inventory.entity';
import { ProductVariationPrice } from './productVariation_price.entity';

@Entity()
export class ProductVariation {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => Product, (product) => product.variations)
  @JoinColumn({ name: 'productId' })
  public product: Product;

  @Column({ type: 'int' })
  public productId: number;


  @OneToMany(() => Inventory, (inventory) => inventory.productVariation)
  public inventory: Inventory[];

  @OneToMany(() => ProductVariationPrice, (price) => price.productVariation)
  public prices: ProductVariationPrice[];

  @ManyToOne(() => Size)
  @JoinColumn({ name: 'sizeCode' })
  public size: Size;

  @Column({ type: 'varchar', length: 7 })
  public sizeCode: string;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'colorName' })
  public color: Color;

  @Column({ type: 'varchar', length: 30 })
  public colorName: string;

  @Column({ type: 'text', array: true, default: [] })
  public imageUrls: string[];

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}