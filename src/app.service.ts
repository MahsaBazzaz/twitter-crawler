import { Injectable } from '@nestjs/common';
import { DbService } from './db.service';
import { NlpService } from './nlp.service';

@Injectable()
export class AppService {

  constructor(
    private readonly dbService: DbService,
    private readonly nlpService: NlpService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async updateAllTokens() {
    const tweets = await this.dbService.getAllTweets();
    for (const tweet of tweets.ok.data) {

      let tokens: string[] = await this.nlpService.getHashtags(tweet.text.toLowerCase());
      await this.dbService.updateTokenTable(tokens, tweet.text);
    }
  }


}
