# Stage 1: Build stage
FROM node:20-slim AS build
WORKDIR /app

# Copy workspace config and lockfile
COPY package*.json ./

# Copy all package.json files from the monorepo
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN npm ci

# Copy the Prisma schema and generate the client
COPY schema.prisma ./apps/api/prisma/schema.prisma
RUN npm run prisma:generate -w @leilportal/api

# Copy the source code for the API and build it
COPY apps/api ./apps/api
RUN npm run build -w @leilportal/api

# Remove dev dependencies
RUN npm prune --omit=dev

# Stage 2: Production runner stage
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs

# Copy built assets and node_modules
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/apps/api/package.json ./package.json

USER nextjs

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main.js"]