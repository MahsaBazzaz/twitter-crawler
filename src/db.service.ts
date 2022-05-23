import { Injectable } from '@nestjs/common';
import { ResponseSchema, Tweet } from 'dtos';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import { json } from 'stream/consumers';
import { TweetV1, TweetV2, UserV2Result } from 'twitter-api-v2';
import { NlpService } from './nlp.service';

@Injectable()
export class DbService {

  constructor(
    @InjectModel() private readonly knex: Knex,
    private readonly nlpService: NlpService
  ) { }
  getHello(): string {
    return 'Hello World!';
  }

  async getAllTweets(limit?: number): Promise<ResponseSchema<Tweet[]>> {
    let response: ResponseSchema<Tweet[]>;
    if (limit != undefined) {
      response = await this.knex.table('tweets')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .then(result => {
          return { ok: { data: result } }
        })
        .catch(err => {
          return { err: { message: err } }
        })
    }
    else {
      response = await this.knex.table('tweets')
        .orderBy('created_at', 'desc')
        .then(result => {
          return { ok: { data: result } }
        })
        .catch(err => {
          return { err: { message: err } }
        })
    }
    return response;
  }

  async getTweet(id: string): Promise<ResponseSchema<Tweet[]>> {
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
        return { ok: { data: result } }
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
    query: any,
    hashtags: any
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
        query: data.query,
        hashtags: data.hashtags
      }], '*')
      .then(result => {
        console.log("addTweet() ok:" + result);
      })
      .catch(err => {
        console.log("addTweet() err:" + err);
      });
  }

  async addRetweet(userId: string, username: string, ownerId: string, ownername: string, tweetId: string) {
    await this.knex.table('retweets').insert(
      [{
        user_id: userId,
        user_name: username,
        owner_id: ownerId,
        owner_name: ownername,
        tweet_id: tweetId,
      }], '*')
      .then(result => {
      })
      .catch(err => {
      });
  }
  async updateTokenTable(tweetTokens: string[], text: string) {
    const allTokens = await this.getAllTokens();
    for (let i = 0; i < tweetTokens.length; i++) {
      const tokensIntersectionWithAllTokens = allTokens.ok.data.find(x => x.token == tweetTokens[i]);
      if (tokensIntersectionWithAllTokens != undefined) {
        await this.updateToken(tweetTokens[i], 1);
      }
      else {
        await this.addToken(tweetTokens[i], 1);
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

  async updateTweet(id: string, likes: number, retweets: number): Promise<ResponseSchema<any>> {
    let response = await this.knex.table('tweets')
      .where('tweet_id', id)
      .update('likes', likes)
      .update('retweets', retweets)
      .then(result => {
        return { ok: { data: result } }
      })
      .catch(err => {
        return { err: { message: err } }
      });
    return response;
  }


  async updateFollowersAndFollowings(user: UserV2Result): Promise<ResponseSchema<any>> {
    let response = await this.knex.table('users')
      .where('user_id', user.data.id)
      .update('tweet_count', user.data.public_metrics.tweet_count)
      .update('followers_count', user.data.public_metrics.followers_count)
      .update('following_count', user.data.public_metrics.following_count)
      .then(result => {
        return { ok: { data: result } }
      })
      .catch(err => {
        return { err: { message: err } }
      });
    return response;
  }

  // async updateHashtags() {

  //   let query = [];
  //   await this.knex.table('tweets').select('hashtags', 'id', 'text')
  //     .then(result => {
  //       query = result;
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });

  //   console.log(query.length);
  //   for (let i = 0; i < query.length; i++) {
  //     if (query[i].hashtags == null) {
  //       let hashtagss = await this.nlpService.getHashtags(query[i].text);
  //       console.log(`id : ${query[i].id}, hashtags: ${hashtagss}`);
  //       await this.knex.table('tweets')
  //         .update('hashtags', hashtagss)
  //         .where('id', query[i].id)
  //         .then(result => {
  //           console.log(result);
  //         })
  //         .catch(err => {
  //           console.log(err);
  //         });
  //     }
  //   }
  // }

  async getGrowthRate(interval: number): Promise<ResponseSchema<number>> {
    const res = await this.knex.raw(`WITH cte AS (
      SELECT DISTINCT
      EXTRACT(hour  FROM created_at) AS _hour
      ,count(*) OVER (PARTITION BY EXTRACT(hour  FROM created_at)) AS _count
      FROM tweets
      WHERE created_at >= current_date at time zone 'UTC' - interval '${interval} hours'	
    )
    SELECT _count - LAG (_count) OVER (ORDER BY _hour ASC) AS _growth
    FROM  cte`)
      .then(result => {
        return { ok: { data: Math.floor(result.rows[0].avg / 60) } }
      })
      .catch(err => {
        return { err: { message: err } }
      });
    return res;
  }

}
