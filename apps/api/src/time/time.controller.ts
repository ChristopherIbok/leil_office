import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AuthUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateTimeLogDto } from "./dto";
import { TimeService } from "./time.service";

@Controller("time-logs")
export class TimeController {
  constructor(private readonly time: TimeService) {}

  @Post()
  @Roles("ADMIN", "TEAM_MEMBER")
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTimeLogDto) {
    return this.time.create(user.sub, dto);
  }

  @Get("me")
  findMine(@CurrentUser() user: AuthUser) {
    return this.time.findMine(user.sub);
  }

  @Get()
  @Roles("ADMIN", "TEAM_MEMBER")
  findByProject(@Query("projectId") projectId: string) {
    return this.time.findByProject(projectId);
  }
}
