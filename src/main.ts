import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origins: ['http://localhost:5173', 'https://gabymakes-servidor.vercel.app', 'https://gabymakes-website-git-develop-cristianos-projects-14338c05.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });



  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('GabyMakes API')
    .addBearerAuth()
    .setDescription('Documentação da GabyMakes API')
    .setVersion('1.0')
    .addTag('products')
    .addTag('upload')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`NestJS application is running on: ${await app.getUrl()}`);

}
bootstrap();
