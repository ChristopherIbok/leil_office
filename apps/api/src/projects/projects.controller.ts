import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { AuthUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateProjectDto, UpdateProjectDto } from "./dto";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  @Roles("ADMIN", "TEAM_MEMBER", "CLIENT")
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    if (user.role === "CLIENT") {
      return this.projects.create({ ...dto, clientId: user.sub });
    }
    return this.projects.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query("search") search?: string) {
    if (user.role === "CLIENT") {
      return this.projects.findByClient(user.sub, search);
    }
    return this.projects.findAll(search);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    if (user.role === "CLIENT") {
      return this.projects.findOneForClient(id, user.sub);
    }
    return this.projects.findOne(id);
  }

  @Patch(":id")
  @Roles("ADMIN", "TEAM_MEMBER")
  update(@Param("id") id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.projects.remove(id);
  }
}
