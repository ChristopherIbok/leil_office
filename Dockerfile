FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy package files
COPY apps/api/package.json apps/api/pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
COPY package.json pnpm-workspace.yaml ./

# Install deps
RUN pnpm install --frozen-lockfile

# Generate Prisma
RUN pnpm exec prisma generate

# Build API
RUN pnpm --filter @leilportal/api build

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]