FROM node:17-alpine3.14 as app

WORKDIR /usr/app
EXPOSE 3000

COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY nest-cli.json ./nest-cli.json
COPY .env ./.env
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY src ./src

RUN npm install
RUN npm run build
