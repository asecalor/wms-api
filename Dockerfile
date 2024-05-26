FROM node:20-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .


RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY .env .
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY nest-cli.json ./nest-cli.json

RUN npm run build

EXPOSE 3001

CMD npm run db:migrate && npm run start:dev
