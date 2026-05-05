FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm ci --prefix server --include=dev \
  && npm ci --prefix client --include=dev

COPY . .

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/server ./server
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/server.js"]
