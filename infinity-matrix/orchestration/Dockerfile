# Orchestration Server - TypeScript/Express
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY server ./server
COPY agents ./agents
COPY types ./types
COPY utils ./utils
COPY services ./services
COPY automation ./automation
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built app
COPY --from=builder /app/dist ./dist

# Create credentials volume mount point
RUN mkdir -p /app/credentials

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start app
CMD ["node", "dist/server/index.js"]
