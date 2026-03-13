import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsEmail, IsOptional, MinLength } from 'class-validator';

/** 注册 */
export class RegisterDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone!: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6位' })
  password!: string;

  @ApiProperty({ description: '邮箱', example: 'user@example.com', required: false })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '邀请码', example: '04985807' })
  @IsString()
  @IsNotEmpty({ message: '邀请码不能为空' })
  inviteCode!: string;
}

/** 密码登录 */
export class PasswordLoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone!: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password!: string;
}

/** 手机号+验证码登录 */
export class PhoneLoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: '短信验证码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

/** 微信登录 */
export class WechatLoginDto {
  @ApiProperty({ description: '微信授权code' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
