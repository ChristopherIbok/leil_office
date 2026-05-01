import { registerAs } from '@nestjs/config';
import { AwsConfig } from './src/config/aws.config.interface';

export default registerAs('aws', (): AwsConfig => ({
  region: process.env.AWS_REGION,
  cognito: {
    userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    clientId: process.env.AWS_COGNITO_CLIENT_ID,
  },
  s3Bucket: process.env.AWS_S3_BUCKET,
}));