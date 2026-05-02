import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post } from "@nestjs/common";
import { AuthUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles("ADMIN", "TEAM_MEMBER")
  findAll() {
    return this.users.findAll();
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: { name: string; email: string; password: string; role?: string }) {
    return this.users.create(dto);
  }

  @Get(":id")
  @Roles("ADMIN")
  findOne(@Param("id") id: string) {
    return this.users.findOne(id);
  }

  @Patch(":id")
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: { name?: string; role?: string }) {
    if (user.role !== "ADMIN" && user.sub !== id) throw new ForbiddenException("You can only update your own profile.");
    const safeDto = user.role === "ADMIN" ? dto : { name: dto.name };
    return this.users.update(id, safeDto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.users.remove(id);
  }
}
