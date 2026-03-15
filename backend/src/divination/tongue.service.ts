import { Injectable, Logger } from '@nestjs/common';

export interface TongueAnalysisResult {
  imageProvided: boolean;
  gender: string;
  birthYear: number | null;
  timestamp: string;
}

@Injectable()
export class TongueService {
  private readonly logger = new Logger(TongueService.name);

  analyze(
    imageBase64: string,
    gender?: string,
    birthYear?: number,
  ): TongueAnalysisResult {
    this.logger.log(
      `舌相分析请求: gender=${gender}, birthYear=${birthYear}, imageSize=${imageBase64?.length || 0}`,
    );
    return {
      imageProvided: !!imageBase64,
      gender: gender || '未知',
      birthYear: birthYear || null,
      timestamp: new Date().toISOString(),
    };
  }
}
