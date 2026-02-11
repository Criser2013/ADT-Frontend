FROM node:25-alpine3.21 AS build

ARG API_URL="http://localhost:5000"
WORKDIR /app

RUN npm install -g npm@latest --no-progress --no-fund
COPY package*.json .
RUN npm ci

ENV VITE_ENVIRONMENT=1
ENV VITE_API_URL=${API_URL}

COPY . .
RUN npm run build

# ---------------------------------------
FROM nginx:1.27.5-alpine3.21
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

RUN adduser -D frontend-user && \
    chown -R frontend-user:frontend-user /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R frontend-user:frontend-user /var/cache/nginx && \
    chown -R frontend-user:frontend-user /var/log/nginx && \
    chown -R frontend-user:frontend-user /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R frontend-user:frontend-user /var/run/nginx.pid

USER frontend-user
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]