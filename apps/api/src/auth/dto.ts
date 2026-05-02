import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsIn(["ADMIN", "TEAM_MEMBER", "CLIENT"])
  role?: "ADMIN" | "TEAM_MEMBER" | "CLIENT";
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
