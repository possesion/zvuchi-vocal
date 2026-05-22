# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:23-alpine AS builder

WORKDIR /app

# Build dependencies for better-sqlite3 (native module)
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

# Copy package files first for layer caching
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Rebuild better-sqlite3 for Alpine Linux
RUN npm rebuild better-sqlite3

# Build the application
RUN npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:23-alpine AS runner

WORKDIR /app

# Runtime dependencies only (no build tools)
RUN apk add --no-cache cairo jpeg pango giflib

# Copy standalone server from builder
COPY --from=builder /app/.next/standalone ./standalone

# Fix: static assets must be inside standalone/ for Next.js standalone mode
COPY --from=builder /app/.next/static ./standalone/.next/static
COPY --from=builder /app/public ./standalone/public

# Copy compiled node_modules from builder (includes native better-sqlite3)
COPY --from=builder /app/node_modules ./standalone/node_modules

# Create data directory for SQLite with correct permissions
RUN mkdir -p /app/data && chown -R node:node /app/data && chown -R node:node /app/standalone

# Run as non-root user
USER node

# Port configuration
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "standalone/server.js"]

