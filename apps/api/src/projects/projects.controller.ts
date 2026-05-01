import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateProjectDto, UpdateProjectDto } from "./dto";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Get()
  findAll() {
    return this.projects.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
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
