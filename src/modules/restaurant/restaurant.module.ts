import { Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuSchema } from './menu.schemea';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

const services = [MenuService];
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DB_COLLECTION_NAMES.MENUS,
        schema: MenuSchema,
      },
    ]),
  ],
  controllers: [MenuController],
  providers: services,
  exports: services,
})
export class RestaurantModule {}
