FROM node:20-alpine

RUN mkdir /app

COPY ./package.* /app

WORKDIR /app

RUN npm install

COPY ./ /app

EXPOSE 3000

ENTRYPOINT ["/app/index.mjs"]