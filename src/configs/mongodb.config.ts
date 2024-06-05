import {
    MongooseModuleOptions,
    MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MongoConfig implements MongooseOptionsFactory {
    constructor(private configService: ConfigService) {}

    createMongooseOptions(): MongooseModuleOptions {
        const host = this.configService.get('MONGO_HOST') || 'localhost';
        const user = this.configService.get('DB_USER');
        const pass = this.configService.get('DB_PASS');
        const port = this.configService.get('DB_PORT');
        const dbName = this.configService.get('DB_NAME');

        return {
            uri: `mongodb://${user}:${pass}@${host}:${port}/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.4`,
            dbName,
        };
    }
}
