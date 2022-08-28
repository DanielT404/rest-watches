import { Module } from '@nestjs/common';
import { WatchesModule } from './watches/watches.module';

@Module({
  imports: [WatchesModule]
})
export class AppModule {}
