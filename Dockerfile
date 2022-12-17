FROM node:17.9.1 as app

WORKDIR /usr/app

COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY nest-cli.json ./nest-cli.json
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY src ./src

RUN npm install
RUN npm run build

CMD ["echo", "you must define 'command' statement."]