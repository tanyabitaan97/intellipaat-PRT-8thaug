FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ .

RUN npm run build


FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install --omit=dev

COPY backend/ .

COPY --from=frontend-build \
     /app/frontend/dist/angular-aws-student-frontend/browser \
     /app/public

EXPOSE 3000

CMD ["node", "server.js"]
