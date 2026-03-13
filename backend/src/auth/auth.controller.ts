import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto, PasswordLoginDto, PhoneLoginDto, WechatLoginDto } from './dto/auth.dto.js';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '注册' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login/password')
  @ApiOperation({ summary: '密码登录' })
  loginByPassword(@Body() dto: PasswordLoginDto) {
    return this.authService.loginByPassword(dto);
  }

  @Post('login/phone')
  @ApiOperation({ summary: '手机号验证码登录' })
  loginByPhone(@Body() dto: PhoneLoginDto) {
    return this.authService.loginByPhone(dto);
  }

  @Post('login/wechat')
  @ApiOperation({ summary: '微信登录' })
  loginByWechat(@Body() dto: WechatLoginDto) {
    return this.authService.loginByWechat(dto);
  }
}
