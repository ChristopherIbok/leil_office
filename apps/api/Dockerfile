# Stage 1: Base image for pnpm environment
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Stage 2: Build stage
FROM base AS build

# Copy the workspace configuration and lockfile first
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all package.json files from the monorepo
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the Prisma schema and generate the client
COPY schema.prisma ./apps/api/prisma/schema.prisma
RUN pnpm --filter @leilportal/api prisma:generate

# Copy the source code for the API and build it
COPY apps/api ./apps/api
RUN pnpm --filter @leilportal/api build

# Use pnpm deploy to create an isolated production directory
RUN pnpm --filter @leilportal/api --prod deploy /app/deployed-api

# Stage 3: Production runner stage
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs

# Copy the deployed application from the build stage
COPY --from=build --chown=nextjs:nodejs /app/deployed-api ./

USER nextjs

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main.js"]