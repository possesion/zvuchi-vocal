# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Build dependencies for:
# - canvas/image processing (cairo, jpeg, pango, giflib)
# - better-sqlite3 native module (python3, make, g++, sqlite-dev)
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev sqlite-dev

# Copy package files first for layer caching
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Set DATABASE_URL for Prisma Client generation
ENV DATABASE_URL="file:./data/wiki.db"

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Note: Database migrations should be run at runtime, not build time
# For production, run: npx prisma migrate deploy

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

# Runtime dependencies only:
# - canvas/image processing (cairo, jpeg, pango, giflib)
# - better-sqlite3 (sqlite-libs)
RUN apk add --no-cache cairo jpeg pango giflib sqlite-libs

# Copy standalone server from builder
COPY --from=builder /app/.next/standalone ./standalone

# Fix: static assets must be inside standalone/ for Next.js standalone mode
COPY --from=builder /app/.next/static ./standalone/.next/static
COPY --from=builder /app/public ./standalone/public

# Copy compiled node_modules from builder (includes Prisma Client and better-sqlite3)
COPY --from=builder /app/node_modules ./standalone/node_modules

# Copy Prisma schema and migrations for runtime
COPY --from=builder /app/prisma ./standalone/prisma

# Copy prisma.config.ts for Prisma v7
COPY --from=builder /app/prisma.config.ts ./standalone/prisma.config.ts

# Copy entrypoint script
COPY docker-entrypoint.sh ./standalone/docker-entrypoint.sh
RUN chmod +x ./standalone/docker-entrypoint.sh

# Create data directory inside standalone for SQLite database
RUN chown -R node:node /app/standalone

# Run as non-root user
USER node

# Port configuration
ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_URL="file:./data/wiki.db"

WORKDIR /app/standalone

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]

