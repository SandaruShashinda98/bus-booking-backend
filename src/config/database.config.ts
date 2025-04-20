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

    // const uri = `mongodb+srv://sandaru:sandaru123@cluster0.ypqcaej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    const uri = `mongodb+srv://shathurthikasree:FecnFFcfw3hI00rJ@busbuddy.zwgrndh.mongodb.net/?retryWrites=true&w=majority&appName=BusBuddy`;

    return {
      uri,
    };
  },
  inject: [ConfigService],
});
