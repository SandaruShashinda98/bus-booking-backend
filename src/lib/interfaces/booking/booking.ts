import { IBaseEntity } from '@interface/common/base-entity';
import { Types } from 'mongoose';

export interface IBooking extends IBaseEntity {
  trip_id: Types.ObjectId;
  booking_id: number; // document count + 1
  seats: number[];
  passenger_name: string;
  passenger_nic: string;
  pick_up_location: string;
  drop_off_location: string;
  contact_no: string;
  email: string;
  guardian_contact_no: string;
  special_instruction: string;
}
export interface IBus extends IBaseEntity {
  bus_number: string;
}
export interface ITrip extends IBaseEntity {
  start_location: string;
  end_location: string;
}

export interface IFood {
  food_name: string;
  ingredients: string[];
  price: string;
  date: Date;
}
export interface IRestaurant extends IBaseEntity {
  name: string;
  foods: IFood[];
}
