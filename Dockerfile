FROM node:14-alpine

RUN apk add --no-cache bash sudo

ENV USER=dokku
ENV UID=1000
ENV GID=1000

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "$(pwd)" \
    --ingroup "$USER" \
    --no-create-home \
    --uid "$UID" \
    "$USER"

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY server ./server/
COPY web ./web/

RUN npm ci --only=production

EXPOSE 8080

CMD [ "npm", "start" ]
