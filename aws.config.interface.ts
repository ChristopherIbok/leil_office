export interface AwsConfig {
  region: string;
  cognito: {
    userPoolId: string;
    clientId: string;
  };
  s3Bucket: string;
}