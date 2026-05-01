import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './create-project.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from '@prisma/client';
import { GetProjectsDto } from './get-projects.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.create(createProjectDto, user.id);
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query() query: GetProjectsDto,
  ) {
    return this.projectsService.findAllForUser(user.id, query);
  }
}