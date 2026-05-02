import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class AwsS3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint?: string;
  private readonly region: string;

  constructor(private readonly config: ConfigService) {
    this.region = this.config.get<string>("AWS_REGION", "us-east-1");
    this.bucket = this.config.getOrThrow<string>("AWS_S3_BUCKET");
    this.endpoint = this.config.get<string>("AWS_S3_ENDPOINT");

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint ?? undefined,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.config.getOrThrow<string>("AWS_SECRET_ACCESS_KEY")
      }
    });
  }

  async createPresignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ACL: "private"
    });

    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }

  buildFileUrl(key: string) {
    if (this.endpoint) {
      return `${this.endpoint.replace(/\/$/, "")}/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  buildProjectFileKey(projectId: string, filename: string) {
    const name = filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
    return `projects/${projectId}/${randomUUID()}-${Date.now()}-${name}`;
  }

  buildChatFileKey(filename: string) {
    const name = filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
    return `chat/${randomUUID()}-${Date.now()}-${name}`;
  }
}
