import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import 'dotenv/config';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { TwitterService } from './twitter.service';
import { TweetV2, UserV2Result } from 'twitter-api-v2';
import { ResponseSchema } from 'dtos';
import { DbService } from './db.service';
import e from 'express';

@Injectable()
export class UpdaterService {
    private tweetQueue: string[] = [];
    private userQueue: string[] = [];
    private tweetQueueIndex: number = 0;
    constructor(
        private readonly twitterService: TwitterService,
        private readonly dbService: DbService
    ) { }

    async init() {
        const response = await this.dbService.getAllTweets();
        if (response.ok) {
            for (const tweet of response.ok.data) {
                this.tweetQueue.push(tweet.tweet_id);
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
        this.tweetQueue.push(id);
        if (this.tweetQueue.length > 100) this.tweetQueue.shift();
    }

    @Cron('31 * * * * *')
    async updateTweet() {
        console.log("<><><><> updateTweet");
        if (this.tweetQueue.length > 0) {
            let tweet: ResponseSchema<TweetV2> = await this.twitterService.tweet(this.tweetQueue[this.tweetQueueIndex]);
            if (tweet.ok) {
                let res = await this.dbService.updateTweet(tweet.ok.data.id, tweet.ok.data.public_metrics.like_count, tweet.ok.data.public_metrics.retweet_count);
                if (res.ok) {
                    console.log("update() ok: " + res.ok.data)
                    this.tweetQueueIndex++;
                    if (this.tweetQueueIndex >= this.tweetQueue.length) this.tweetQueueIndex = 0;
                }
                else {
                    console.log(res.err.message);
                }
            }
            else {
                console.log("update() twitter err: " + tweet.err.message);
                this.tweetQueue.splice(this.tweetQueueIndex, 1);
            }
        }
    }

    @Cron('1 * * * * *')
    async updateUser() {
        console.log("<><><><> updateUser");
        if (this.userQueue.length > 0) {
            // console.log("update() " + this.index + this.queue[this.index]);
            let index = this.userQueue.pop();
            let user: ResponseSchema<UserV2Result> = await this.twitterService.user(index);
            if (user.ok) {
                let res = await this.dbService.updateFollowersAndFollowings(user.ok.data);
                if (res.ok) {
                    console.log("update() ok: " + res.ok.data)
                }
                else {
                    console.log(res.err.message);
                }
            }
            else {
                console.log("update() twitter err: " + user.err.message);
            }
        }
    }

    async updateAllTweets() {
        const tweets = await this.dbService.getAllTweets();
        this.tweetQueue = [];
        for (const tweet of tweets.ok.data) {
            this.tweetQueue.push(tweet.tweet_id);
        }
    }

    async updateAllUsers() {
        const users = await this.dbService.getAllUserIds();
        this.userQueue = [];
        for (const user of users.ok.data) {
            this.userQueue.push(user);
        }
    }
}