# Wms Api

## Installation
```bash
$ npm install
```
## Project Configuration

You should create an .env file in the root of the project and add the following variables:

```env
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=wms-api
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/wms-api"
```

## Running the Database
To run the database, execute the following command in the terminal:
```bash
$ docker compose up
```

## Execute migrations and seed
To execute the migrations and seed, execute the following command in the terminal:
```bash
$ npx prisma migrate dev
```

```bash
$ npx prisma db seed
```

## To run the API, execute the following command in the terminal:
```bash
$ npm run start:dev
```