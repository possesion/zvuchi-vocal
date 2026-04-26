# Build stage
FROM node:23-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:23-alpine

WORKDIR /app

# Install runtime dependencies for better-sqlite3
# RUN apk add --no-cache cairo jpeg pango giflib

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Copy .env file (will be overridden by mounted volume or env vars)
COPY .env .env

# Expose port
EXPOSE 3000


# Start the application
CMD ["npm", "start"]
