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

      let tokens: string[] = await this.nlpService.getTokens(tweet.text.toLowerCase());

      const keywords = await this.dbService.getAllKeywords();
      const tokensIntersectionWithKeywords = tokens.filter(value => keywords.ok.data.includes(value));
      if (tokensIntersectionWithKeywords.length > 0) {
        await this.dbService.updateTokenTable(tokens, tweet.text);
      }
    }
  }
}
