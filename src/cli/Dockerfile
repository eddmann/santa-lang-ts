FROM node:16.16.0-alpine3.15
COPY build/cli.js /usr/bin/santa-cli
COPY build/bin/linux-x64-node-16/deasync.node /usr/bin/bin/linux-x64-node-16/deasync.node
RUN echo -e "#!/bin/sh\nexec /usr/bin/santa-cli \$@" > /entrypoint.sh \
 && chmod +x /usr/bin/santa-cli /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
