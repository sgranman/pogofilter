# Optional anonymous usage counters for PoGoFilter. No npm dependencies:
# node:sqlite is built into Node 22.
FROM node:22-alpine
WORKDIR /app
COPY access.mjs app.mjs server.mjs admin.html admin.js ./
ENV NODE_ENV=production \
    NODE_OPTIONS=--no-warnings \
    STATS_DB=/data/stats.db \
    PORT=8090
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8090
HEALTHCHECK --interval=60s --timeout=3s --start-period=20s --start-interval=2s \
  CMD wget -qO- http://127.0.0.1:8090/healthz || exit 1
CMD ["node", "server.mjs"]
