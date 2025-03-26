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
  make_model?: string;
  year_of_manufacture?: number;
  seating_capacity?: number;
  facility_details?: string;
  assigned_route?: string;
  driver_conductor_linked?: string;
}

export interface IBusStaff extends IBaseEntity {
  staff_id: string;
  staff_name?: string;
  role?: string;
  contact_number?: string;
  assigned_trip?: string;
  assigned_bus_number?: string;
}

export interface ITrip extends IBaseEntity {
  start_location?: string;
  destination?: string;
  start_date?: any;
  end_date?: any;
  status?: string;
  price?: string;
  bus_number?: string;
  booked_seats?: any[];
}

//---- restaurant
export interface IMenu extends IBaseEntity {
  food: string;
  ingredients?: string;
  price?: number;
  date?: Date;
  count: any;
  orders?: { order_by_nic: any; qty: any }[];
}
