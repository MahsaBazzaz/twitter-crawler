import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import 'dotenv/config';
import { ETwitterStreamEvent, TweetStream, TweetV1, TweetV2SingleStreamResult, TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';
import { ResponseSchema } from 'dtos';
import { DbService } from './db.service';
import { TwitterService } from './twitter.service';
import { UpdaterService } from './update.service';
import { NlpService } from './nlp.service';


@Injectable()
export class CrawlerService {
    private twitterClient: TwitterApi;
    private readonly roClient: TwitterApiReadOnly;
    private streamFilter: TweetStream<TweetV1>;
    private stream: TweetStream<TweetV2SingleStreamResult>;

    constructor(
        private readonly dbService: DbService,
        private readonly twitterService: TwitterService,
        private readonly updateService: UpdaterService,
        private readonly nlpService: NlpService
    ) {
        // OAuth 1.0a client
        this.twitterClient = new TwitterApi({
            appKey: process.env.API_Key,
            appSecret: process.env.API_Key_Secret,
            accessToken: process.env.Access_Token,
            accessSecret: process.env.Access_Token_Secret
        });

        // Tell typescript it's a readonly app
        this.roClient = this.twitterClient.readOnly;
    }

    getHello(): string {
        return 'Hello World!';
    }

    async startStream(): Promise<any> {
        let users: ResponseSchema<string[]> = await this.dbService.getAllUserIds();
        let keywords: ResponseSchema<string[]> = await this.dbService.getAllKeywords();
        if (users.ok && keywords.ok) {
            this.streamFilter = await this.roClient.v1.filterStream({
                follow: users.ok.data, tweet_mode: 'extended', format: 'detailed'
            });
        }

        this.streamFilter.on(
            // Emitted when Node.js {response} is closed by remote or using .close().
            ETwitterStreamEvent.ConnectionClosed,
            () => console.log('Connection has been closed.'),
        );

        this.streamFilter.on(
            // Emitted when a Twitter payload (a tweet or not, given the endpoint).
            ETwitterStreamEvent.Data,
            eventData => {
                // console.log('Twitter has sent something:', eventData.text);
                if(eventData != undefined) this.processTweet(eventData);
            },

        );

        this.streamFilter.on(
            // Emitted when a Twitter sent a signal to maintain connection active
            ETwitterStreamEvent.DataKeepAlive,
            () => console.log('Twitter has a keep-alive packet.'),
        );

    }

    async stopStream() {
        // Be sure to close the stream where you don't want to consume data anymore from it
        this.streamFilter.close();
    }

    async restartSream(): Promise<ResponseSchema<any>> {
        console.log("restartSream()");
        this.stopStream();
        this.startStream();
        return { ok: { data: null } }
    }

    async processTweet(tweet: any) {
        let id: string;
        let text: string;
        let username: string;
        let created_at: string;
        let user_id: string;
        let likes: number;
        let retweets: number
        if (tweet.retweeted_status != undefined) {
            id = tweet.retweeted_status.id_str;
            tweet.retweeted_status?.extended_tweet != undefined ? text = tweet.retweeted_status.extended_tweet.full_text : text = tweet.retweeted_status.text;
            username = tweet.retweeted_status?.user?.screen_name;
            created_at = tweet.retweeted_status?.created_at;
            user_id = tweet.retweeted_status.user?.id_str;
            likes = tweet.retweeted_status?.favorite_count;
            retweets = tweet.retweeted_status?.retweet_count;
        }
        else {
            id = tweet.id_str;
            tweet?.extended_tweet != undefined ? text = tweet.extended_tweet?.full_text : text = tweet?.text;
            username = tweet?.user?.screen_name;
            created_at = tweet?.created_at;
            user_id = tweet?.user.id_str;
            likes = tweet?.favorite_count;
            retweets = tweet?.retweet_count;
        }
        console.log(text);
        let result = await this.dbService.getTweet(id);
        if (result.ok) {
            if (result.ok.data.length <= 0) {
                if (id != undefined && text != undefined && username != undefined && user_id != undefined) {
                    let tokens: string[] = await this.nlpService.getTokens(text);

                    const keywords = await this.dbService.getAllKeywords();
                    const tokensIntersectionWithEnStopwords = tokens.filter(value => keywords.ok.data.includes(value));
                    if (tokensIntersectionWithEnStopwords.length > 0) {
                        this.updateService.addToQueue(id);
                        await this.dbService.addTweet({ id: id, text: text, user_id: user_id, username: username, created_at: created_at, likes: likes, retweeted: retweets, query: tweet });
                        await this.dbService.updateTokenTable(tokens, text);
                        let existingUser = await this.dbService.getUser(user_id);
                        if (existingUser.ok) {
                            if (existingUser.ok.data.length <= 0) {
                                let res = await this.twitterService.userByUsername(username);
                                await this.dbService.addUser(
                                    res.ok.data.id,
                                    res.ok.data.username,
                                    res.ok.data.name,
                                    res.ok.data?.profile_image_url,
                                    res.ok.data?.verified,
                                    res.ok.data?.location,
                                    res.ok.data?.url,
                                    res.ok.data?.protected,
                                    res.ok.data?.created_at,
                                    res.ok.data?.public_metrics?.followers_count,
                                    res.ok.data?.public_metrics?.following_count,
                                    res.ok.data?.public_metrics?.tweet_count
                                );
                            }
                        }
                        else {
                            console.log(existingUser.err.message);
                        }
                    }
                }
            }
            else {
                console.log('tweet already exists');
            }
        }

    }



}