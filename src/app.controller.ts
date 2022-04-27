import { Body, Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CRAWLER_CMD } from '../constants';
import { AppService } from './app.service';
import { CrawlerService } from './crawler.service';
import { NlpService } from './nlp.service';
import { UpdaterService } from './update.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly crawlerService: CrawlerService,
    private readonly updaterService: UpdaterService,
  ) {
    this.startStream();
    this.updaterService.init();
  }

  @Get()
  Hello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get("getTokens")
  // getTokens(@Body('text') text :string ) {
  //   return this.nlpService.getTokens(text);
  // }

  // @Get("updateAllTokens")
  // updateAllTokens() {
  //   return this.appService.updateAllTokens();
  // }

  @Get("start")
  startStream() {
    this.crawlerService.startStream();
  }

  @Get("stop")
  stopStream() {
    this.crawlerService.stopStream();
  }

  @MessagePattern("RESTART")
  restartStream() {
    console.log("<><><><><><> restart <><><><>")
    return this.crawlerService.restartSream();
  }

}
