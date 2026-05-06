FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force
COPY frontend/ .
RUN npm run build

FROM node:20-alpine AS backoffice-deps
WORKDIR /backoffice
COPY backofficee/package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force
COPY backofficee/ .
RUN npm prune --production

FROM nginx:alpine
RUN apk add --no-cache nodejs npm
COPY --from=frontend-build /app/build /usr/share/nginx/html
COPY --from=backoffice-deps /backoffice /backoffice
COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80 5173
ENTRYPOINT ["/docker-entrypoint.sh"]