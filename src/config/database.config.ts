import { MONGO_CONFIG_KEYS } from '@constant/common/mongo-config-keys';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const DatabaseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const username = configService.get(MONGO_CONFIG_KEYS.MONGODB_USERNAME);
    const password = configService.get(MONGO_CONFIG_KEYS.MONGODB_PASSWORD);
    const host = configService.get(MONGO_CONFIG_KEYS.MONGODB_HOST);
    const port = configService.get(MONGO_CONFIG_KEYS.MONGODB_PORT);
    const database = configService.get(MONGO_CONFIG_KEYS.MONGODB_DATABASE);

    const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;

    return {
      uri,
    };
  },
  inject: [ConfigService],
});
