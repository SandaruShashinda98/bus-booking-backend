import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
  InternalServerErrorException,
  Delete,
} from '@nestjs/common';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { Permissions } from '@common/decorators/permissions.decorator';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { RestaurantService } from '../services/restaurant.service';
import { IFood, IRestaurant } from '@interface/booking/booking';

@ApiTags('restaurant')
@Controller({ path: 'restaurant' })
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiOperation({
    summary: 'Get all restaurants with filters and pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterRestaurants(@Query() queryParams: any) {
    const foundRestaurants =
      await this.restaurantService.filterDocumentsWithPagination(
        {},
        queryParams.start || 0,
        queryParams.size || 0,
      );

    return foundRestaurants;
  }

  @ApiOperation({
    summary: 'Get single restaurant by id',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleRestaurant(@Param() pathParams: ObjectIDPathDTO) {
    const foundRestaurant = await this.restaurantService.findById(
      pathParams.id,
    );

    if (!foundRestaurant)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundRestaurant };
  }

  @ApiOperation({ summary: 'Create new restaurant' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post()
  async createNewRestaurant(
    @Body() createRestaurantDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const restaurantData: IRestaurant = {
      name: createRestaurantDto.name,
      foods: createRestaurantDto.foods || [],
      is_active: createRestaurantDto.is_active ?? true,
      created_by: loggedUser._id,
    };

    const newRestaurant =
      await this.restaurantService.addNewDocument(restaurantData);

    if (!newRestaurant)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newRestaurant };
  }

  @ApiOperation({ summary: 'Update restaurant' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id')
  async updateRestaurant(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateRestaurantDto: any,
  ) {
    const updatedRestaurant = await this.restaurantService.updateDocument({
      ...updateRestaurantDto,
      changed_by: loggedUser._id,
    });

    if (!updatedRestaurant)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedRestaurant };
  }

  @ApiOperation({ summary: 'Add food to restaurant' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id/food')
  async addFoodToRestaurant(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() foodDto: any,
  ) {
    const restaurant = await this.restaurantService.findById(pathParams.id);

    if (!restaurant)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    const food: IFood = {
      food_name: foodDto.food_name,
      ingredients: foodDto.ingredients || [],
      price: foodDto.price,
      date: foodDto.date || new Date(),
    };

    // Add the new food to the restaurant's foods array
    //   const updatedRestaurant = await this.restaurantService.updateDocument({
    //     _id: pathParams.id,
    //     $push: { foods: food },
    //     changed_by: loggedUser._id,
    //   });

    //   if (!updatedRestaurant)
    //     throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    //   return { data: updatedRestaurant };
  }

  @ApiOperation({ summary: 'Remove food from restaurant' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Delete(':id/food/:foodId')
  async removeFoodFromRestaurant(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Param('foodId') foodId: string,
  ) {
    const restaurant = await this.restaurantService.findById(pathParams.id);

    if (!restaurant)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    // Remove the food from the restaurant's foods array
    //   const updatedRestaurant = await this.restaurantService.updateDocument({
    //     _id: pathParams.id,
    //     $pull: { foods: { _id: foodId } },
    //     changed_by: loggedUser._id,
    //   });

    //   if (!updatedRestaurant)
    //     throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    //   return { data: updatedRestaurant };
  }

  @ApiOperation({ summary: 'Update food in restaurant' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id/food/:foodId')
  async updateFoodInRestaurant(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Param('foodId') foodId: string,
    @Body() foodDto: any,
  ) {
    const restaurant = await this.restaurantService.findById(pathParams.id);

    if (!restaurant)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    // Update the food in the restaurant's foods array
    //   const updatedRestaurant = await this.restaurantService.updateDocument({
    //     _id: pathParams.id,
    //     $set: {
    //       "foods.$[food].food_name": foodDto.food_name,
    //       "foods.$[food].ingredients": foodDto.ingredients,
    //       "foods.$[food].price": foodDto.price,
    //       "foods.$[food].date": foodDto.date,
    //     },
    //     changed_by: loggedUser._id,
    //   }, {
    //     arrayFilters: [{ "food._id": foodId }]
    //   });

    //   if (!updatedRestaurant)
    //     throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    //   return { data: updatedRestaurant };
  }
}
