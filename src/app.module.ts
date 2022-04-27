import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import { ConfigModule } from '@nestjs/config';
import 'dotenv/config';
import { TwitterService } from './twitter.service';
import { DbService } from './db.service';
import { CrawlerService } from './crawler.service';
import { UpdaterService } from './update.service';
import { NlpService } from './nlp.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    KnexModule.forRoot({
      config: {
        client: 'pg',
        version: '5.7',
        useNullAsDefault: true,
        connection: {
          host: '127.0.0.1',
          port: 5432,
          user: 'postgres',
          password: 'pa$$w0rd',
          database: 'twitter'
        },
        pool: {
          max: 5
        }
      },
    }),
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true
    }),
    HttpModule,
    ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, TwitterService, DbService, CrawlerService, UpdaterService, NlpService],
})
export class AppModule { }
