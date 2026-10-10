# Docker-out-of-docker runner for the Ofelia-scheduled PoGoFilter auto-deploy.
# Ofelia `job-exec`s deploy/update.sh into a long-running container built from
# this image (see deploy/deployer.compose.yml and the [job-exec] block in the
# server's ~/docker/ofelia/config.ini).
#
# It drives the HOST Docker daemon via the mounted socket, so it needs the
# docker + compose CLIs, plus git to fetch origin/main (over HTTPS: the repo is
# public, so there is no deploy key). The repo is bind-mounted, not baked in.
FROM alpine:3.20
RUN apk add --no-cache docker-cli docker-cli-compose docker-cli-buildx git bash

# Runs as the host user that owns the checkout, so fetches never leave
# root-owned files behind that the host user can't then write.
ARG HOST_UID=1000
ARG HOST_GID=1000
RUN addgroup -g ${HOST_GID} deployer 2>/dev/null || true; \
    adduser -D -u ${HOST_UID} -G "$(getent group ${HOST_GID} | cut -d: -f1)" -h /home/deployer deployer

# The bind-mounted repo's owner may not match exactly; this container only
# ever touches that one repo, so trust it.
RUN git config --system --add safe.directory '*'

CMD ["tail", "-f", "/dev/null"]
