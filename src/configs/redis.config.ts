import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class RedisConfig implements CacheOptionsFactory {
    constructor(private configService: ConfigService) {}

    private TIME_TO_LIMIT = 1 * 60; // 1 minutes

    createCacheOptions(): CacheModuleOptions {
        return {
            store: redisStore,
            host: this.configService.get('REDIS_HOST'),
            port: this.configService.get('REDIS_PORT'),
            ttl: this.TIME_TO_LIMIT,
        };
    }
}
