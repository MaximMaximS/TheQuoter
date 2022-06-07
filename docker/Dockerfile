FROM node:18-alpine3.14
WORKDIR /srv
ENV NODE_ENV production
COPY ../package*.json .
RUN apk add --no-cache make gcc g++ python3 && \
    npm ci --production --ignore-scripts && npm cache clean --force && \
    npm rebuild bcrypt --build-from-source && \
    apk del make gcc g++ python3
RUN npm i -g nodemon
COPY .. ./
CMD npm start