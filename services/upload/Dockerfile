# Dockerfile
FROM node:18.18.2-alpine AS base

FROM base AS build
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package*.json ./
RUN npm Install
# Copy app source
COPY . .
RUN npm run build

FROM base AS release
RUN npm ci --only=production
# Create app directories
RUN mkdir -p logs
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs
# Expose port
EXPOSE 8989
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "./build/index.js"]
