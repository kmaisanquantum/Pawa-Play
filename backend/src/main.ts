import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RegulatoryConfigService } from './config/regulatory-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1', { exclude: ['health', '/health'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const regulatoryConfig = app.get(RegulatoryConfigService);
  const { mode } = regulatoryConfig.current();

  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Regulatory-Mode', mode);
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('PawaPlay API')
    .setDescription(`Phase 0 vertical slice — REGULATORY_MODE=${mode}`)
    .setVersion('0.1.0-phase0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`PawaPlay backend running on :${port} [REGULATORY_MODE=${mode}]`);
}
bootstrap();
