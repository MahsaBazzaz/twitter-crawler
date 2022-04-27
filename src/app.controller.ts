import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CrawlerService } from './crawler.service';
import { UpdaterService } from './update.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly crawlerService: CrawlerService,
    private readonly updaterService: UpdaterService
  ) {
    // this.startStream();
    // this.updaterService.init();
  }

  @Get()
  Hello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("updateAllTokens")
  updateAllTokens() {
    return this.appService.updateAllTokens();
  }

  startStream() {
    this.crawlerService.startStream();
  }

  stopStream() {
    this.crawlerService.stopStream();
  }


}
