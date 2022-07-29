FROM node:16.16.0-alpine3.15
COPY build/cli.js /usr/bin/santa-cli
RUN echo -e "#!/bin/sh\nexec /usr/bin/santa-cli \$@" > /entrypoint.sh \
 && chmod +x /usr/bin/santa-cli /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
