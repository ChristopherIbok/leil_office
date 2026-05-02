import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { CurrentUser, AuthUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register({ ...dto, role: undefined });
  }

  @Post("admin/register")
  @Roles("ADMIN")
  adminRegister(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }

  @Patch("password")
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: { currentPassword: string; newPassword: string }
  ) {
    return this.auth.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }
}
