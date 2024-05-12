import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async getKey(id: string) {
        return await this.cacheManager.get(id);
    }

    async storeKey(id: string, publicKey: string, refreshToken: string = '') {
        let refreshTokensUsed = [];

        if (refreshToken) {
            // refresh token call
            const findKey: any = await this.cacheManager.get(id);
            refreshTokensUsed = [...findKey.refreshTokensUsed, refreshToken];
        }

        await this.cacheManager.set(id, { publicKey, refreshTokensUsed }, {
            ttl: 86400,
        } as any);
    }

    async deleteKey(id: string) {
        return await this.cacheManager.del(id);
    }
}
