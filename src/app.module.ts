import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { WatchesModule } from './watches/watches.module';

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
    WatchesModule
  ]
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
