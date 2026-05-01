import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { AwsS3Service } from "../common/aws/aws-s3.service";

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [FilesService, AwsS3Service]
})
export class FilesModule {}
