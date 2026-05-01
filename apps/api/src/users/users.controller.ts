import { Controller, Get, Param } from "@nestjs/common";
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

  @Get(":id")
  @Roles("ADMIN")
  findOne(@Param("id") id: string) {
    return this.users.findOne(id);
  }
}
