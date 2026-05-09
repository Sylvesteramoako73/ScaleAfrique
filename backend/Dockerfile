# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npm run db:generate

# Copy source and build
COPY src ./src
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS production

RUN apk add --no-cache wget

WORKDIR /app

# Only copy production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma files (runtime needs them)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Copy built app
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["node", "dist/server.js"]
