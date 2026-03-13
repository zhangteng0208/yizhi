import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';

@ApiTags('产品')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiQuery({ name: 'category', required: false, description: '分类筛选：八字、塔罗、起名、风水' })
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
