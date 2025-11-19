
FROM node:18-alpine

WORKDIR /app

COPY package*.json /app

RUN npm i

ADD . /app

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

