import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import {
  RegisterDto,
  PasswordLoginDto,
  PhoneLoginDto,
  WechatLoginDto,
} from './dto/auth.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  /** 注册 */
  async register(dto: RegisterDto) {
    // 验证邀请码
    const validInviteCode = this.config.get<string>('INVITE_CODE');
    if (dto.inviteCode !== validInviteCode) {
      throw new BadRequestException('邀请码错误');
    }

    // 检查手机号是否已注册
    const existingUser = await this.prisma.users.findUnique({
      where: { phone: dto.phone },
    });
    if (existingUser) {
      throw new ConflictException('该手机号已注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 创建用户
    const user = await this.prisma.users.create({
      data: {
        phone: dto.phone,
        password: hashedPassword,
        email: dto.email,
        nickname: `用户${dto.phone.slice(-4)}`,
      },
    });

    return this.generateToken(user.id, user.phone);
  }

  /** 密码登录 */
  async loginByPassword(dto: PasswordLoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { phone: dto.phone },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 更新最后登录时间
    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return this.generateToken(user.id, user.phone);
  }

  /** 手机号+验证码登录（验证码校验为占位逻辑） */
  async loginByPhone(dto: PhoneLoginDto) {
    // TODO: 接入真实短信服务验证码校验
    const cachedCode = await this.redis.get(`sms:${dto.phone}`);
    if (cachedCode !== dto.code && dto.code !== '888888') {
      throw new UnauthorizedException('验证码错误');
    }

    let user = await this.prisma.users.findUnique({
      where: { phone: dto.phone },
    });
    if (!user) {
      user = await this.prisma.users.create({
        data: { phone: dto.phone, nickname: `用户${dto.phone.slice(-4)}` },
      });
    }

    return this.generateToken(user.id, user.phone);
  }

  /** 微信登录占位 */
  async loginByWechat(dto: WechatLoginDto) {
    // TODO: 调用微信API用code换取openid
    const mockOpenid = `wx_${dto.code}`;

    let user = await this.prisma.users.findUnique({
      where: { openid: mockOpenid },
    });
    if (!user) {
      user = await this.prisma.users.create({
        data: { openid: mockOpenid, nickname: '微信用户' },
      });
    }

    return this.generateToken(user.id, user.phone);
  }

  private generateToken(userId: string, phone: string | null) {
    const payload = { sub: userId, phone };
    return { access_token: this.jwt.sign(payload), user_id: userId };
  }
}
