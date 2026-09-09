FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY mcp/package.json mcp/package-lock.json ./mcp/
RUN npm ci --omit=dev --prefix mcp

COPY --chown=node:node . .

USER node

CMD ["node", "mcp/server.js"]
