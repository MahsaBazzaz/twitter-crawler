import { Injectable } from '@nestjs/common';

@Injectable()
export class DbService {
  getHello(): string {
    return 'Hello World!';
  }

  
}
