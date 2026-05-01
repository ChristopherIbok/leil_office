FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json
RUN pnpm install --filter @leilportal/api... --frozen-lockfile=false

FROM deps AS build
COPY apps/api apps/api
COPY packages packages
RUN pnpm --filter @leilportal/api prisma:generate
RUN pnpm --filter @leilportal/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
CMD ["node", "apps/api/dist/main.js"]
