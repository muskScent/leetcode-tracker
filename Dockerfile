# ── Stage 1: build client ────────────────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /build/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ── Stage 2: build server ────────────────────────────────────────────────────
FROM node:20-alpine AS server-builder
# better-sqlite3 requires native compilation
RUN apk add --no-cache python3 make g++
WORKDIR /build/server
COPY server/package.json ./
RUN npm install
COPY server/ ./
RUN npm run build && npm prune --omit=dev

# ── Stage 3: production image ────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app/server

# Copy server production node_modules (includes compiled better-sqlite3 bindings)
COPY --from=server-builder /build/server/node_modules ./node_modules
# Copy compiled NestJS app
COPY --from=server-builder /build/server/dist ./dist
# Copy built React app to the path ServeStaticModule expects:
# app.module.ts uses join(__dirname, '..', 'client', 'dist')
# __dirname at runtime = /app/server/dist  →  resolved = /app/server/client/dist
COPY --from=client-builder /build/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
