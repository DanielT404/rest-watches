import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteLoggingService } from 'src/utils/logging/RouteLoggingService';
import { Watch } from './entities/watch.entity';
import { WatchesController } from './watches.controller';
import { WatchesService } from './watches.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      connectTimeoutMS: process.env.PG_CONNECTION_TIMEOUT_MS
        ? parseInt(process.env.PG_CONNECTION_TIMEOUT_MS)
        : 3500,
      maxQueryExecutionTime: process.env.PG_MAX_QUERY_EXECUTION_TIME
        ? parseInt(process.env.PG_MAX_QUERY_EXECUTION_TIME)
        : 1200,
      replication: {
        master: {
          host: process.env.PG_MASTER_HOST
            ? process.env.PG_MASTER_HOST
            : 'postgresql-master',
          port: process.env.PG_MASTER_PORT
            ? parseInt(process.env.PG_MASTER_PORT as string)
            : 5432,
          username: process.env.PG_MASTER_USERNAME
            ? process.env.PG_MASTER_USERNAME
            : 'pg-user',
          password: process.env.PG_MASTER_PASSWORD
            ? process.env.PG_MASTER_PASSWORD
            : 'pg-password',
          database: process.env.PG_MASTER_DATABASE
            ? process.env.PG_MASTER_DATABASE
            : 'pg-main'
        },
        slaves: [
          {
            host: process.env.PG_SLAVE_HOST
              ? process.env.PG_SLAVE_HOST
              : 'postgresql-slave',
            port: process.env.PG_SLAVE_PORT
              ? parseInt(process.env.PG_SLAVE_PORT as string)
              : 5432,
            username: process.env.PG_SLAVE_USERNAME
              ? process.env.PG_SLAVE_USERNAME
              : 'pg-user',
            password: process.env.PG_SLAVE_PASSWORD
              ? process.env.PG_SLAVE_PASSWORD
              : 'pg-password',
            database: process.env.PG_SLAVE_DATABASE
              ? process.env.PG_SLAVE_DATABASE
              : 'pg-main'
          }
        ]
      },
      synchronize: true,
      autoLoadEntities: true
    }),
    WinstonModule.forRoot({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
      ),
      defaultMeta: { service: 'watches-rest-api' },
      transports: [
        new winston.transports.File({
          dirname: 'logs',
          filename: 'error.log',
          level: 'error'
        }),
        new winston.transports.File({
          dirname: 'logs',
          filename: 'combined.log',
          level: 'http'
        })
      ]
    }),
    ThrottlerModule.forRoot({
      ttl: process.env.THROTTLE_TTL
        ? parseInt(process.env.THROTTLE_TTL as string)
        : 60,
      limit: process.env.THROTTLE_LIMIT
        ? parseInt(process.env.THROTTLE_LIMIT as string)
        : 20
    }),
    TypeOrmModule.forFeature([Watch])
  ],
  controllers: [WatchesController],
  providers: [
    WatchesService,
    RouteLoggingService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class WatchesModule {}
