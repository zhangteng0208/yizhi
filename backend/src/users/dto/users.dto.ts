import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateProfileDto {
  @ApiPropertyOptional({ description: '档案标签，如"本人"、"父亲"' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '性别 0=未知 1=男 2=女' })
  @IsOptional()
  @IsInt()
  gender?: number;

  @ApiPropertyOptional({ description: '出生年' })
  @IsOptional()
  @IsInt()
  birth_year?: number;

  @ApiPropertyOptional({ description: '出生月' })
  @IsOptional()
  @IsInt()
  birth_month?: number;

  @ApiPropertyOptional({ description: '出生日' })
  @IsOptional()
  @IsInt()
  birth_day?: number;

  @ApiPropertyOptional({ description: '出生时（0-23）' })
  @IsOptional()
  @IsInt()
  birth_hour?: number;

  @ApiPropertyOptional({ description: '出生分钟' })
  @IsOptional()
  @IsInt()
  birth_minute?: number;

  @ApiPropertyOptional({ description: '是否农历' })
  @IsOptional()
  @IsBoolean()
  is_lunar?: boolean;

  @ApiPropertyOptional({ description: '是否闰月' })
  @IsOptional()
  @IsBoolean()
  is_leap_month?: boolean;

  @ApiPropertyOptional({ description: '出生省份' })
  @IsOptional()
  @IsString()
  birth_province?: string;

  @ApiPropertyOptional({ description: '出生城市' })
  @IsOptional()
  @IsString()
  birth_city?: string;

  @ApiPropertyOptional({ description: '出生地纬度' })
  @IsOptional()
  @IsNumber()
  birth_lat?: number;

  @ApiPropertyOptional({ description: '出生地经度' })
  @IsOptional()
  @IsNumber()
  birth_lng?: number;
}

export class UpdateProfileDto extends CreateProfileDto {}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
