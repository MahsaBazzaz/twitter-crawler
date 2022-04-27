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
      let tokens: string[] = await this.nlpService.getTokens(tweet.text);
      let stems: string[] = [];
      for (const element of tokens) {
        stems.push(await this.nlpService.stem(element));
      }
      const keywords = await this.dbService.getAllKeywords();
      const tokensIntersectionWithKeywords = tokens.filter(value => keywords.ok.data.includes(value));
      const stemsIntersectionWithKeywords = stems.filter(value => keywords.ok.data.includes(value));
      if (tokensIntersectionWithKeywords.length > 0 || stemsIntersectionWithKeywords.length > 0) {
        await this.dbService.updateTokenTable(tokens, tweet.text);
      }
    }
  }
}
