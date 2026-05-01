import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateTaskDto, UpdateTaskDto } from "./dto";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  @Roles("ADMIN", "TEAM_MEMBER")
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Get()
  findAll(@Query("projectId") projectId?: string) {
    return this.tasks.findAll(projectId);
  }

  @Patch(":id")
  @Roles("ADMIN", "TEAM_MEMBER")
  update(@Param("id") id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(id, dto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.tasks.remove(id);
  }
}
