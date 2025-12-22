# ---------- Base image ----------
FROM oven/bun:1.1.8 AS base
WORKDIR /app

# ---------- Install deps ----------
FROM base AS deps
COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile

# ---------- Build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ---------- Runtime ----------
FROM oven/bun:1.1.8-slim AS runtime
WORKDIR /app

# Copy built app and dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

# Drizzle migrations
COPY drizzle.config.ts ./
COPY --from=build /app/src/db/migrations ./src/db/migrations
# Environment
ENV NODE_ENV=production
EXPOSE 5000

CMD ["bun", "dist/index.js"]