## Proof of Concept - Watches REST API using NestJS + TypeORM stack.
### First time personal attempt using this stack

![PoC](https://cv-variants-bucket.s3.eu-central-1.amazonaws.com/poc.png)

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Setting up the app

```bash
# development
$ docker-compose -f development.docker-compose.yml up --build -d

# production ( not quite production ready, still needs some tweaks :( )
$ docker-compose up --build -d
```

## Tests 

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Running the app

API playground and documentation is available [here](http://localhost:3000/api).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - Daniel Țună
- Website - [https://idratherprogram.com](https://idratherprogram.com/)

## License
No license.