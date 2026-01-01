# Frontend Dockerfile - Optimized for Google Cloud Run
# Multi-stage build for optimal size and performance

FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY frontend ./

# Build React app
RUN npm run build

# Production stage - Serve with Node.js
FROM node:20-alpine

WORKDIR /app

# Install lightweight HTTP server
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Environment configuration
ENV PORT=3000
ENV NODE_ENV=production

# Expose port (Cloud Run uses 8080 by default, but we'll use 3000)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Run static server
CMD ["serve", "-s", "dist", "-l", "3000"]
