# ==========================================
# Stage 1 - Build Angular frontend
# ==========================================
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build


# ==========================================
# Stage 2 - Run Angular + Node API
# ==========================================
FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ .

# Angular build is served by Express from /public
COPY --from=frontend-build \
     /app/frontend/dist/angular-aws-student-frontend/browser \
     /app/public

EXPOSE 3000

CMD ["node", "server.js"]
