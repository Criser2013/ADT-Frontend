FROM node:24-alpine3.21 AS build
ARG API_URL="http://localhost:5000"
WORKDIR /app
COPY package*.json .
RUN npm ci
ENV VITE_ENTORNO=1
ENV VITE_API_URL=${API_URL}
COPY . .
RUN npm run build

FROM nginx:1.27.5-alpine3.21
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]