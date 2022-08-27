import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watch } from './entities/watch.entity';
import { WatchesController } from './watches.controller';
import { WatchesService } from './watches.service';

@Module({
  imports: [
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class WatchesModule {}
