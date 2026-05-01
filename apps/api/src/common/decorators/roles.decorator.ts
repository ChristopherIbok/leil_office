import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: Array<"ADMIN" | "TEAM_MEMBER" | "CLIENT">) => SetMetadata(ROLES_KEY, roles);
