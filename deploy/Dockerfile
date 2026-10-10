# Runtime image for the home server. deploy.sh builds dist/ locally and ships
# it to ~/pogofilter next to this file (as Dockerfile), so the host never runs
# npm. The repo-root Dockerfile is the self-contained build for anyone else.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=60s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
