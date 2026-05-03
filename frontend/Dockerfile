FROM node:20 as frontend-build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ .
RUN npm run build

FROM node:20 as backoffice-deps

WORKDIR /backoffice

COPY backofficee/package*.json ./
RUN npm install --legacy-peer-deps

COPY backofficee/ .

FROM nginx:alpine

RUN apk add --no-cache nodejs npm

COPY --from=frontend-build /app/build /usr/share/nginx/html
COPY --from=backoffice-deps /backoffice /backoffice
COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 5173

ENTRYPOINT ["/docker-entrypoint.sh"]