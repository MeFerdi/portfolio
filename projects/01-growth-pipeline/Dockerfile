# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
# Playwright does not ship musl builds of Chromium, so the Alpine image uses the
# distro package. If rendering misbehaves, switch the runtime stage to the
# official mcr.microsoft.com/playwright image (Debian-based).
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
ENV NODE_ENV=production \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY config ./config
COPY migrations ./migrations
USER node
CMD ["node", "dist/index.js"]
