import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AuthUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateFileRecordDto, PresignUploadDto } from "./dto";
import { FilesService } from "./files.service";

@Controller("files")
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post("presign")
  @Roles("ADMIN", "TEAM_MEMBER")
  presign(@Body() dto: PresignUploadDto) {
    return this.files.createPresignedUpload(dto);
  }

  @Post()
  @Roles("ADMIN", "TEAM_MEMBER")
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFileRecordDto) {
    return this.files.create(user.sub, dto);
  }

  @Get("project/:projectId")
  findByProject(@Param("projectId") projectId: string) {
    return this.files.findByProject(projectId);
  }
}
