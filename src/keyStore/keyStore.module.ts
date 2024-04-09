import { Module } from '@nestjs/common';
import { KeyStoreService } from './keyStore.service';

@Module({
  providers: [KeyStoreService],
})
export class KeyStoreModule {}
