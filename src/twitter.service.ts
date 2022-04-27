import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import 'dotenv/config';
import { TweetStream, TweetV1, TweetV2SingleStreamResult, TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';

@Injectable()
export class TwitterService {
    
}
