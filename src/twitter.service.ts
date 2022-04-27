import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import 'dotenv/config';
import { TweetStream, TweetV1, TweetV2SingleResult, TweetV2SingleStreamResult, TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';
import { ResponseSchema } from 'dtos';
import { DbService } from './db.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TwitterService {
    private twitterClient: TwitterApi;
    private readonly roClient: TwitterApiReadOnly;

    // private readonly client;
    constructor(private readonly httpService: HttpService) {
        // Instanciate with desired auth type (here's Bearer v2 auth)
        this.twitterClient = new TwitterApi(process.env.bearer_token);
        // Tell typescript it's a readonly app
        this.roClient = this.twitterClient.readOnly;
    }

    getHello(): string {
        return 'Hello World!';
    }

    async userByUsername(username: string): Promise<ResponseSchema<any>> {
        const response = await this.roClient.v2.userByUsername(username,
            {
                "user.fields": ["created_at", "description", "entities", "id",
                    "location", "name", "pinned_tweet_id", "profile_image_url",
                    "protected", "public_metrics", "url", "username", "verified", "withheld"]
            });
        if (response.errors) {
            return { err: { message: response.errors[0].detail } }
        }
        if (response.data) {
            return { ok: { data: response.data } }
        }
        return null;
    }

    async tweet(id: string): Promise<any> {
        const response: TweetV2SingleResult = await this.roClient.v2.singleTweet(id
            ,
            {
                "tweet.fields": ["attachments", "author_id", "context_annotations", "conversation_id", "created_at",
                    "entities", "geo", "id", "in_reply_to_user_id", "lang", "public_metrics", "possibly_sensitive", "referenced_tweets",
                    "reply_settings", "source", "text", "withheld"],
            }
        );
        if (response.errors) {
            return { err: { message: response.errors[0].detail } }
        }
        if (response.data) {
            return { ok: { data: response.data } }
        }
    }

}
