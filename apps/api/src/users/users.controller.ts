import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
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
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() dto: { name?: string; role?: string }) {
    return this.users.update(id, dto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.users.remove(id);
  }
}
