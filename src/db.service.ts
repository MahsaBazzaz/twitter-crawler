import { Injectable } from '@nestjs/common';
import { ResponseSchema, Tweet } from 'dtos';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import { TweetV2 } from 'twitter-api-v2';

@Injectable()
export class DbService {

  constructor(
    @InjectModel() private readonly knex: Knex,
  ) { }
  getHello(): string {
    return 'Hello World!';
  }

  async getAllTweets(limit : number): Promise<ResponseSchema<Tweet[]>> {
    const response = await this.knex.table('tweets')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .then(result => {
        return { ok: { data: result } }
      })
      .catch(err => {
        return { err: { message: err } }
      })
    return response;
  }

  async getTweet(id : string): Promise<ResponseSchema<Tweet[]>> {
    const response = await this.knex.table('tweets')
      .where('tweet_id', id)
      .then(result => {
        return { ok: { data: result } }
      })
      .catch(err => {
        return { err: { message: err } }
      })
    return response;
  }

  async getAllUserIds(): Promise<ResponseSchema<string[]>> {
    let response = await this.knex.table('users').select('user_id')
      .then(result => {
        let res: string[] = []
        for (const userid of result) {
          res.push(userid.user_id)
        }
        return { ok: { data: res } };
      })
      .catch(err => {
        return { err: { message: err } };
      });
    return response;
  }

  async getUser(id: string): Promise<ResponseSchema<any>> {
    let response = await this.knex.table('users').where('user_id', id)
      .then(result => {
        if (result.length <= 0) {
          return { ok: { data: result } }
        }
      })
      .catch(err => {
        return { err: { message: err } };
      });
    return response;
  }

  async getAllKeywords(): Promise<ResponseSchema<string[]>> {
    let response = await this.knex.table('keywords').returning('word')
      .then(result => {
        let res: string[] = []
        for (const keyword of result) {
          res.push(keyword.word)
        }
        return { ok: { data: res } };
      })
      .catch(err => {
        return { err: { message: err } };
      });
    return response;
  }

  async getAllTokens(): Promise<ResponseSchema<{ token: string }[]>> {
    let response = await this.knex.table('tokens').returning('token')
      .then(result => {
        return { ok: { data: result } };
      })
      .catch(err => {
        return { err: { message: err } };
      });
    return response;
  }

  async addTweet(data: {
    id: string,
    text: string,
    user_id: string,
    username: string,
    created_at: string,
    likes: number,
    retweeted: number,
    query: any
  }) {
    await this.knex.table('tweets').insert(
      [{
        tweet_id: data.id,
        text: data.text,
        user_id: data.user_id,
        username: data.username,
        created_at: data.created_at,
        likes: data.likes,
        retweets: data.retweeted,
        query: data.query
      }], '*')
      .then(result => {
        console.log("addTweet() ok:" + result);
      })
      .catch(err => {
        console.log("addTweet() err:" + err);
      });
  }

  async updateTokenTable(tweetTokens: string[], text: string) {
    const allTokens = await this.getAllTokens();
    for (let i = 0; i < tweetTokens.length; i++) {
      const tokensIntersectionWithAllTokens = allTokens.ok.data.find(x => x.token == tweetTokens[i]);
      var count = (text.match(tweetTokens[i]) || []).length;
      if (tokensIntersectionWithAllTokens != undefined) {
        await this.updateToken(tweetTokens[i], count);
      }
      else {
        await this.addToken(tweetTokens[i], count);
      }
    }
  }

  async addToken(token: string, count: number) {
    let response = await this.knex.table('tokens').insert(
      [{
        token: token,
        count: count
      }], '*')
      .then(result => {
        // console.log("addToken() ok : " + token + " " + count)
      })
      .catch(err => {
        console.log("addToken() err: " + err)
      });
  }

  async updateToken(token: string, count: number) {
    await this.knex.table('tokens').increment('count', count).where('token', token)
      .then(result => {
        // console.log("updateToken() ok: " + token + " " + count)
      })
      .catch(err => {
        console.log("updateToken() err: " + err)
      });
  }

  async addUser(
    id: string, username: string, name: string, image_url: string, verified: boolean,
    location: string, url: string, ifProtected: boolean, created_at: string,
    followers_count: number, following_count: number, tweet_count: number
  ): Promise<ResponseSchema<any>> {
    const user = await this.knex.table('users').where('username', username).returning('*');
    if (user.length > 0) {
      return { err: { message: 'user already exists' } }
    }
    else {
      let response = await this.knex.table('users').insert(
        [{
          user_id: id,
          username: username,
          name: name,
          image_url: image_url,
          verified: verified,
          location: location,
          url: url,
          protected: ifProtected,
          created_at: created_at,
          followers_count: followers_count,
          following_count: following_count,
          tweet_count: tweet_count
        }], '*')
        .then(result => {
          return { ok: { data: result } }
        })
        .catch(err => {
          return { err: { message: err } }
        });
      return response;

    }
  }

  async updateTweetLikesAndRetweets(tweet: TweetV2,): Promise<ResponseSchema<any>> {
    let response = await this.knex.table('tweets')
      .where('tweet_id', tweet.id)
      .increment('likes', tweet.public_metrics.like_count)
      .increment('retweets', tweet.public_metrics.retweet_count)
      .then(result => {
        return { ok: { data: result } }
      })
      .catch(err => {
        return { err: { message: err } }
      });
    return response;
  }

}
