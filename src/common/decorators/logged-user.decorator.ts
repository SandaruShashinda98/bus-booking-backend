import { ILoggedUser } from '@interface/authorization/user';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/* This code snippet is defining a custom parameter decorator named `LoggedUser` in a TypeScript file.
The `createParamDecorator` function is used to create this decorator. */
export const LoggedUser = createParamDecorator(
  (_data: void, ctx: ExecutionContext) => {
    const request: any = ctx.switchToHttp().getRequest();
    return request.user as ILoggedUser;
  },
);
