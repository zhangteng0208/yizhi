import { Injectable, Logger } from '@nestjs/common';

export interface FengshuiAnalysisResult {
  imageProvided: boolean;
  direction: string;         // 朝向
  houseType: string;         // 户型描述
  ownerGender: string;       // 户主性别
  ownerBirthYear: number | null;
  timestamp: string;
}

@Injectable()
export class FengshuiService {
  private readonly logger = new Logger(FengshuiService.name);

  analyze(
    imageBase64: string,
    direction?: string,
    houseType?: string,
    ownerGender?: string,
    ownerBirthYear?: number,
  ): FengshuiAnalysisResult {
    this.logger.log(`风水分析请求: direction=${direction}, houseType=${houseType}, ownerGender=${ownerGender}, ownerBirthYear=${ownerBirthYear}, imageSize=${imageBase64?.length || 0}`);
    return {
      imageProvided: !!imageBase64,
      direction: direction || '未知',
      houseType: houseType || '未知',
      ownerGender: ownerGender || '未知',
      ownerBirthYear: ownerBirthYear || null,
      timestamp: new Date().toISOString(),
    };
  }
}
