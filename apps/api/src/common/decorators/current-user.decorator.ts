import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type AuthUser = {
  sub: string;
  email: string;
  role: "ADMIN" | "TEAM_MEMBER" | "CLIENT";
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});
