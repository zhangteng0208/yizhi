import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';
import {
  UpdateUserDto,
  CreateProfileDto,
  UpdateProfileDto,
} from './dto/users.dto.js';

@ApiTags('用户')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.getMe(user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: '更新用户基本信息' })
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.sub, dto);
  }

  // 兼容旧接口
  @Get('me/profile')
  @ApiOperation({ summary: '获取默认档案' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Put('me/profile')
  @ApiOperation({ summary: '更新默认档案' })
  upsertProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.upsertProfile(user.sub, dto);
  }

  // 多档案 CRUD
  @Get('me/profiles')
  @ApiOperation({ summary: '获取所有档案' })
  getProfiles(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfiles(user.sub);
  }

  @Post('me/profiles')
  @ApiOperation({ summary: '创建档案' })
  createProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProfileDto,
  ) {
    return this.usersService.createProfile(user.sub, dto);
  }

  @Put('me/profiles/:id')
  @ApiOperation({ summary: '更新指定档案' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfileById(user.sub, id, dto);
  }

  @Delete('me/profiles/:id')
  @ApiOperation({ summary: '删除指定档案' })
  deleteProfile(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.deleteProfile(user.sub, id);
  }
}
