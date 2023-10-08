FROM oven/bun:1.0.4-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY server ./server/
COPY web ./web/

RUN bun i

EXPOSE 8080

CMD [ "bun", "start" ]
