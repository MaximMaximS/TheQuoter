FROM node:18-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY ./package*.json ./

RUN apk add --no-cache make gcc g++ python3 && \
    npm ci --omit=dev --ignore-scripts && \
    npm rebuild bcrypt --build-from-source && \
    npm cache clean --force && \
    apk del make gcc g++ python3

COPY ./ ./

CMD ["npm", "start"]