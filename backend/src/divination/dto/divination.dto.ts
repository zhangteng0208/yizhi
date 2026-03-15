import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreateDivinationDto {
  @ApiProperty({ description: '姓名', example: '张三' })
  @IsString()
  name!: string;

  @ApiProperty({ description: '性别 1=男 2=女', example: 1 })
  @IsInt()
  gender!: number;

  @ApiProperty({ description: '出生年', example: 1990 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  birthYear!: number;

  @ApiProperty({ description: '出生月', example: 6 })
  @IsInt()
  @Min(1)
  @Max(12)
  birthMonth!: number;

  @ApiProperty({ description: '出生日', example: 15 })
  @IsInt()
  @Min(1)
  @Max(31)
  birthDay!: number;

  @ApiProperty({ description: '出生时辰（地支）', example: '寅' })
  @IsString()
  birthHour!: string;

  @ApiPropertyOptional({ description: '是否农历', default: false })
  @IsOptional()
  @IsBoolean()
  isLunar?: boolean;

  @ApiPropertyOptional({ description: '用户提问' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ description: '产品ID' })
  @IsOptional()
  @IsInt()
  product_id?: number;
}
