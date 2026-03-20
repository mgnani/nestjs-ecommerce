import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { variationTypesKeys } from 'src/database/entities/product.entity';
import { ProductDetails, ProductDetailsTypeFn } from './productDetails';

export class VariationItemDto {
  @IsString() @IsNotEmpty() public colorName: string;
  @IsString() @IsNotEmpty() public sizeCode: string;
  @IsString() @IsNotEmpty() public image: string;
  @IsNumber() @IsNotEmpty() public price: number;
  @IsNumber() @IsNotEmpty() public quantity: number;
  @IsString() @IsNotEmpty() public countryCode: string;
  @IsString() @IsNotEmpty() public currencyCode: string;
}

export class CreateProductDto {
  @IsNumber() @IsNotEmpty() public categoryId: number;
  @IsString() @IsNotEmpty() public title: string;
  @IsString() @IsNotEmpty() public code: string;
  @IsString() @IsNotEmpty() public description: string;
  
  @IsDefined() @IsString() @IsIn(variationTypesKeys) 
  public variationType: string;

  @ArrayMinSize(1) @IsString({ each: true }) 
  public about: string[];

  @IsDefined()
  @Type(ProductDetailsTypeFn)
  @ValidateNested()
  public details: ProductDetails;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariationItemDto)
  public variations: VariationItemDto[];
}