# Build the static site, then serve it from a small nginx image.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Optional anonymous usage counts (see stats/README.md). Off unless set to 1.
ARG VITE_STATS=""
RUN npm test && VITE_STATS="$VITE_STATS" npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=60s --timeout=3s --start-period=30s --start-interval=2s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
