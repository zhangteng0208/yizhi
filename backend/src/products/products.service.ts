import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.products.findMany({
      where: {
        is_active: true,
        ...(category ? { category } : {}),
      },
      orderBy: { sort_order: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.products.findUnique({ where: { id } });
  }
}
