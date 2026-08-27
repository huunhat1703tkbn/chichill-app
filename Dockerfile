# -----------------------------------------------------------------------------
# Dockerfile for ChiChill AI (Google Cloud Run & Container Deployment)
# -----------------------------------------------------------------------------

# Step 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build Vite frontend and Express backend bundle
RUN npm run build

# Step 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy built artifacts and necessary production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/app-config.json ./app-config.json

# Create data directory for local fallback storage if Firestore is optional
RUN mkdir -p /app/data

# Cloud Run listens on PORT environment variable (default 8080)
EXPOSE 8080

# Start server
CMD ["node", "dist/server.cjs"]
