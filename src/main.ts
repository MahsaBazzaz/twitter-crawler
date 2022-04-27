import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';


const microserviceOptions = {
  transport: Transport.NATS,
  options: {
    url: 'nats://localhost:4222',
  }
};

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, microserviceOptions);
  app.listen();
}
bootstrap();
