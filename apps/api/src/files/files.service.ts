import { Injectable } from "@nestjs/common";
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
}
