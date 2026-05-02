# Stage 1: Base image for pnpm environment
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Stage 2: Build stage
FROM base AS build

# Copy workspace config and lockfile first for better layer caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all package.json files from the monorepo
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy Prisma schema from its canonical location and generate the client
COPY apps/api/prisma ./apps/api/prisma
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN pnpm --filter @leilportal/api prisma:generate

# Copy source code and build
COPY apps/api ./apps/api
COPY packages ./packages
COPY tsconfig.base.json ./
RUN pnpm --filter @leilportal/api build

# Create isolated production deployment
RUN pnpm --filter @leilportal/api --prod deploy /app/deployed-api

# Stage 3: Production runner
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nodejs

COPY --from=build --chown=nodejs:nodejs /app/deployed-api ./

USER nodejs

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main.js"]
