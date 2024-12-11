FROM nginx:alpine AS runner

ARG VERSION
ARG CREATED

LABEL org.opencontainers.image.version=${VERSION}

LABEL org.opencontainers.image.created=${CREATED}

LABEL org.opencontainers.image.authors="liunian@2077tech.com"
LABEL org.opencontainers.image.vendor="领起科技"

COPY ./config/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./web-app/dist /usr/share/nginx/html

WORKDIR /usr/share/nginx/html

