# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# corpus/ seeds the in-memory store; migrations/ documents the pg schema.
COPY corpus ./corpus
COPY migrations ./migrations
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
