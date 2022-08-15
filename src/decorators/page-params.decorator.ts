import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PageParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;
    return {
      page: params.page,
      take: params.limit,
    };
  },
);
