import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('DB_USER')}:${configService.get('DB_PASS')}@127.0.0.1:${configService.get('DB_PORT')}/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.4`,
        dbName: configService.get('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MongoDBModule {}
