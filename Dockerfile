FROM node:14-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY pre-commit ./

RUN npm ci --only=production

COPY server ./server/
COPY web ./web/

EXPOSE 8080

CMD [ "npm", "start" ]
