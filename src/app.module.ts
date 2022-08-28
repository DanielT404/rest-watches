import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WatchesModule } from './watches/watches.module';

@Module({
  imports: [WatchesModule]
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
