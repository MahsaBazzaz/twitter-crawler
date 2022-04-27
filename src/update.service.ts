import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import 'dotenv/config';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { TwitterService } from './twitter.service';
import { TweetV2 } from 'twitter-api-v2';
import { ResponseSchema } from 'dtos';
import { DbService } from './db.service';
import e from 'express';

@Injectable()
export class UpdaterService {
    private queue: string[] = [];
    private index: number = 0;
    constructor(
        private readonly twitterService: TwitterService,
        private readonly dbService: DbService
    ) { }

    async init() {
        const response = await this.dbService.getAllTweets(10);
        if (response.ok) {
            for (const tweet of response.ok.data) {
                this.queue.push(tweet.tweet_id);
            }
        }
        else {
            console.log(response.err.message);
        }
    }
    getHello(): string {
        return 'Hello World!';
    }

    addToQueue(id: string) {
        console.log("addToQueue() " + id);
        this.queue.push(id);
        if (this.queue.length > 30) this.queue.shift();
    }

    // @Interval(3000)
    async update() {
        console.log("update time! ");
        if (this.queue.length > 0) {
            console.log("update() " + this.index + this.queue[this.index]);
            let tweet: ResponseSchema<TweetV2> = await this.twitterService.tweet(this.queue[this.index]);
            if (tweet.ok) {
                let res = await this.dbService.updateTweetLikesAndRetweets(tweet.ok.data);
                if (res.ok) {
                    console.log("update() ok: " + res.ok.data)
                    this.index++;
                    if (this.index >= this.queue.length) this.index = 0
                }
                else {
                    console.log(res.err.message);
                }
            }
            else {
                console.log("update() twitter err: " + tweet.err.message);
            }
        }
    }
}