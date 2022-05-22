import { Injectable } from '@nestjs/common';
import 'dotenv/config';
var natural = require('natural');
const { removeStopwords, eng } = require('stopword')

@Injectable()
export class NlpService {
    private readonly tokenizer;
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
    }

    getHello(): string {
        return 'Hello World!';
    }



    private async tokenize(text: string): Promise<string[]> {
        let tokens = this.tokenizer.tokenize(text);
        return tokens;
    }

    private async porterStem(word: string): Promise<string> {
        return natural.PorterStemmer.stem(word);
    }

    private async lancasterStem(word: string): Promise<string> {
        return natural.LancasterStemmer.stem(word);
    }

    async getHashtags(text: string): Promise<string[]> {
        let hashtags = [];
        let splitted: string[] = await this.removeStopwords(text.toLowerCase().split(' '));
        for (const t of splitted) {
            if (t.startsWith("#")) {
                hashtags.push(t);
            }
        }
        return hashtags;
    }

    async getTokens(text: string): Promise<string[]> {
        let removedStopWords: string[] = await this.removeStopwords(text.toLowerCase().split(' '));

        let cleaned: string[] = await this.clean(removedStopWords);

        return cleaned;
    }

    private async removeStopwords(text: string[]) {
        return removeStopwords(text, eng);
    }

    private async clean(input: string[]): Promise<string[]> {
        let newString: string[] = [];
        for (const t of input) {
            if (!t.includes("@") && !t.includes("https:") && !t.includes("www.") && !t.includes("http:") && !/\d/.test(t)) {
                let str = t.replace(/[^\w\s]|_/g, "");
                if (str.length > 0) { newString.push(str); }
            }
        }
        return newString;
    }

}