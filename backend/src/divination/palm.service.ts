import { Injectable, Logger } from '@nestjs/common';

export interface PalmAnalysisResult {
  imageProvided: boolean;
  hand: string;
  gender: string;
  birthYear: number | null;
  timestamp: string;
}

@Injectable()
export class PalmService {
  private readonly logger = new Logger(PalmService.name);

  analyze(imageBase64: string, hand?: string, gender?: string, birthYear?: number): PalmAnalysisResult {
    this.logger.log(`手相分析请求: hand=${hand}, gender=${gender}, birthYear=${birthYear}, imageSize=${imageBase64?.length || 0}`);
    return {
      imageProvided: !!imageBase64,
      hand: hand || '左手',
      gender: gender || '未知',
      birthYear: birthYear || null,
      timestamp: new Date().toISOString(),
    };
  }
}
