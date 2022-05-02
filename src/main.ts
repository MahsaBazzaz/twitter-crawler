import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  //we have a hybrid app here!
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice({
    transport: Transport.NATS,
  });
  // app.enableCors();
  let port = 3030;
  await app.listen(port);
}
bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
//     AppModule,
//     {
//       transport: Transport.NATS,
//     },
//   );
//   app.listen();
// }
// bootstrap();

