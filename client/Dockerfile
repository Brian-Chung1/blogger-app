FROM node:14-slim as build

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

