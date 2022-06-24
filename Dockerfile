FROM node:14-alpine

RUN apk add --no-cache bash

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY server ./server/
COPY web ./web/

RUN npm ci --only=production

EXPOSE 8080

CMD [ "npm", "start" ]
