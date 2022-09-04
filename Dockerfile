FROM node:18-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY ./package*.json ./

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY ./ ./

CMD ["npm", "start"]
