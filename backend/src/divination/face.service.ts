import { Injectable, Logger } from '@nestjs/common';

export interface FaceAnalysisResult {
  imageProvided: boolean;
  gender: string;
  birthYear: number | null;
  timestamp: string;
}

@Injectable()
export class FaceService {
  private readonly logger = new Logger(FaceService.name);

  analyze(
    imageBase64: string,
    gender?: string,
    birthYear?: number,
  ): FaceAnalysisResult {
    this.logger.log(
      `面相分析请求: gender=${gender}, birthYear=${birthYear}, imageSize=${imageBase64?.length || 0}`,
    );
    return {
      imageProvided: !!imageBase64,
      gender: gender || '未知',
      birthYear: birthYear || null,
      timestamp: new Date().toISOString(),
    };
  }
}
