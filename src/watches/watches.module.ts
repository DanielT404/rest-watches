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
