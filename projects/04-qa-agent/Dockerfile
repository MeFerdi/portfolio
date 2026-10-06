# Diagnosis service image. The repository under test is mounted read-only at /repo
# (REPO_ROOT) so the agent can read source files referenced by stack traces.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production \
    REPO_ROOT=/repo \
    DIAGNOSIS_PORT=4000
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
