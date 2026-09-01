import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Pulls the authenticated user's id off the request, set by AuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);
