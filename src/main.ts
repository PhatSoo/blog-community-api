import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logging/winston.log';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger({ instance: winstonLogger }),
    });

    app.use(helmet());
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );
    app.setGlobalPrefix('/api/v1');

    await app.listen(8000);
}
bootstrap();
