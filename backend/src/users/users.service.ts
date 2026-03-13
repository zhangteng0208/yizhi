import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto, CreateProfileDto, UpdateProfileDto } from './dto/users.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    return this.prisma.users.update({
      where: { id: userId },
      data: dto,
    });
  }

  // === 兼容旧接口（单数 profile） ===

  async getProfile(userId: string) {
    return this.prisma.user_profiles.findFirst({ where: { user_id: userId, is_default: true } });
  }

  async upsertProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await this.prisma.user_profiles.findFirst({
      where: { user_id: userId, is_default: true },
    });
    if (existing) {
      return this.prisma.user_profiles.update({
        where: { id: existing.id },
        data: dto,
      });
    }
    return this.prisma.user_profiles.create({
      data: { user_id: userId, is_default: true, ...dto },
    });
  }

  // === 多档案 CRUD ===

  async getProfiles(userId: string) {
    return this.prisma.user_profiles.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: 'desc' }, { created_at: 'asc' }],
    });
  }

  async createProfile(userId: string, dto: CreateProfileDto) {
    const count = await this.prisma.user_profiles.count({ where: { user_id: userId } });
    return this.prisma.user_profiles.create({
      data: { user_id: userId, is_default: count === 0, ...dto },
    });
  }

  async updateProfileById(userId: string, profileId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.user_profiles.findFirst({
      where: { id: profileId, user_id: userId },
    });
    if (!profile) throw new NotFoundException('档案不存在');
    return this.prisma.user_profiles.update({
      where: { id: profileId },
      data: dto,
    });
  }

  async deleteProfile(userId: string, profileId: string) {
    const profile = await this.prisma.user_profiles.findFirst({
      where: { id: profileId, user_id: userId },
    });
    if (!profile) throw new NotFoundException('档案不存在');
    if (profile.is_default) {
      const count = await this.prisma.user_profiles.count({ where: { user_id: userId } });
      if (count <= 1) throw new BadRequestException('至少保留一个档案');
      // 删除 default 后，将最早的档案设为 default
      await this.prisma.user_profiles.delete({ where: { id: profileId } });
      const next = await this.prisma.user_profiles.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'asc' },
      });
      if (next) {
        await this.prisma.user_profiles.update({ where: { id: next.id }, data: { is_default: true } });
      }
      return { success: true };
    }
    await this.prisma.user_profiles.delete({ where: { id: profileId } });
    return { success: true };
  }
}
