FROM node:20-alpine

WORKDIR /app

# Copy only package files first (cache layer)
COPY package*.json ./
RUN npm ci --legacy-peer-deps \
    && npm cache clean --force

# Copy source after deps (cache preserved if no package change)
COPY . .

RUN npm prune --production

EXPOSE 5000
CMD ["node", "server.js"]