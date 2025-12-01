FROM node:25-alpine3.21 AS build
ARG API_URL="http://localhost:5000"
WORKDIR /app
RUN npm install -g npm@11.6.4 --no-progress --no-fund && npm cache clean --force
COPY package*.json .
RUN npm ci
ENV VITE_ENVIRONMENT=1
ENV VITE_API_URL=${API_URL}
COPY . .
RUN npm run build

FROM nginx:1.27.5-alpine3.21
COPY --from=build /app/dist /usr/share/nginx/html
RUN useradd -M frontend-user
RUN chown frontend-user 1000:1000 /usr/share/nginx/html
USER frontend-user
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]