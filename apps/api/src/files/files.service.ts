import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { AwsS3Service } from "../common/aws/aws-s3.service";
import { CreateFileRecordDto, PresignUploadDto } from "./dto";

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService, private readonly awsS3: AwsS3Service) {}

  async createPresignedUpload(dto: PresignUploadDto) {
    const key = this.awsS3.buildProjectFileKey(dto.projectId, dto.name);
    const url = await this.awsS3.createPresignedUploadUrl(key, dto.mimeType);
    return {
      uploadUrl: url,
      key,
      fileUrl: this.awsS3.buildFileUrl(key)
    };
  }

  create(uploadedBy: string, dto: CreateFileRecordDto) {
    return this.prisma.file.create({ data: { ...dto, uploadedBy } });
  }

  findByProject(projectId: string) {
    return this.prisma.file.findMany({
      where: { projectId },
      include: { uploader: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async findByProjectForClient(projectId: string, clientId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });
    if (!project) throw new ForbiddenException("Access denied");
    const isMember = project.members.some((m: { userId: string }) => m.userId === clientId);
    const isClient = project.clientId === clientId;
    if (!isMember && !isClient) throw new ForbiddenException("Access denied");
    return this.findByProject(projectId);
  }
}
