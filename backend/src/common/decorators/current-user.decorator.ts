import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class JwtPayload {
  sub!: string;
  phone?: string;
}

/** 从 JWT 中提取当前用户信息 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data ? user?.[data] : user;
  },
);
