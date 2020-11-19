FROM node:lts

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm ci

COPY ./src ./src

CMD ["node", "./src/app.js"]
