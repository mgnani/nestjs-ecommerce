import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RoleIds } from '../../role/enum/role.enum';
import { CreateProductDto } from '../dto/product.dto';
import { ProductService } from '../services/product.service';
import { Auth } from 'src/api/auth/guards/auth.decorator';
import { FindOneParams } from 'src/common/helper/findOneParams.dto';
import { CurrentUser } from 'src/api/auth/guards/user.decorator';
import { User } from 'src/database/entities/user.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  async getProduct(@Param() params: FindOneParams) {
    return this.productService.getProduct(params.id);
  }

  @Auth(RoleIds.Admin, RoleIds.Merchant)
  @Post('/create')
  async createProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productService.createProduct(body, user.id);
  }

  @Auth(RoleIds.Admin, RoleIds.Merchant)
  @Put(':id')
  async updateProduct(
    @Param() params: FindOneParams,
    @Body() body: CreateProductDto, 
    @CurrentUser() user: User,
  ) {
    return this.productService.updateProduct(params.id, body, user.id);
  }

  @Auth(RoleIds.Admin, RoleIds.Merchant)
  @Delete(':id')
  async deleteProduct(
    @Param() params: FindOneParams,
    @CurrentUser() user: User,
  ) {
    return this.productService.deleteProduct(params.id, user.id);
  }
}