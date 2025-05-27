FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk update && apk upgrade --no-cache && npm install

COPY . .

RUN npm run build
