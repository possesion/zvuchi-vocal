# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:23-alpine AS builder

WORKDIR /app

# Build dependencies for canvas/image processing
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

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

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:23-alpine AS runner

WORKDIR /app

# Runtime dependencies only (no build tools, no better-sqlite3 dependencies)
RUN apk add --no-cache cairo jpeg pango giflib

# Copy standalone server from builder
COPY --from=builder /app/.next/standalone ./standalone

# Fix: static assets must be inside standalone/ for Next.js standalone mode
COPY --from=builder /app/.next/static ./standalone/.next/static
COPY --from=builder /app/public ./standalone/public

# Copy compiled node_modules from builder (includes Prisma Client)
COPY --from=builder /app/node_modules ./standalone/node_modules

# Copy Prisma schema and migrations for runtime
COPY --from=builder /app/prisma ./standalone/prisma

# Create data directory inside standalone for SQLite database
RUN mkdir -p /app/standalone/data && chown -R node:node /app/standalone

# Run as non-root user
USER node

# Port configuration
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV DATABASE_URL="file:./data/wiki.db"

WORKDIR /app/standalone

EXPOSE 3000

CMD ["node", "server.js"]

