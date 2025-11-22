# Multi-stage Dockerfile for PortNumberGenerator

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src ./src
COPY index.ts ./
COPY types.ts ./

# Build TypeScript
RUN npm install -g typescript && \
    tsc --skipLibCheck

# Stage 2: Production
FROM node:20-alpine AS production

# Add labels
LABEL maintainer="PortNumberGenerator Engineering Team"
LABEL description="Enterprise-grade port number generation system"
LABEL version="8.0.0"

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built artifacts and dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3000
EXPOSE 9090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "dist/index.js"]

# Stage 3: Development
FROM node:20-alpine AS development

WORKDIR /app

# Install development tools
RUN npm install -g tsx typescript nodemon

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000
EXPOSE 9090
EXPOSE 9229

# Development command with hot reload
CMD ["tsx", "watch", "index.ts"]
