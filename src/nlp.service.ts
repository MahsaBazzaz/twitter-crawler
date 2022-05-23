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
        let hashtags: string[] = text.toLowerCase().match(/#[a-z]+/gi);
        if (hashtags != null)
            return hashtags
        else
            return [];
    }

    async getTokens(text: string): Promise<string[]> {
        let txt = this.getWords(text);
        let removedStopWords: string[] = await removeStopwords(txt.toLowerCase().split(' '));

        let cleaned: string[] = await this.clean(removedStopWords);

        return cleaned;
    }

    private async removeStopwords(text: string[]) {
        return removeStopwords(text, eng);
    }

    private getWords(str: string): string {
        if ((str === null) || (str === ''))
            return '';
        else
            str = str.toString();
        let pattern = /[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g;
        let text = str.replace(pattern, '');
        return text;
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