FROM oven/bun:alpine
ARG TARGETARCH
COPY dist/santa-cli-linux-${TARGETARCH} /usr/bin/santa-cli
RUN chmod +x /usr/bin/santa-cli
ENTRYPOINT ["/usr/bin/santa-cli"]
