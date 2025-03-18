// Always use plural values
// API_KEYS: api_keys <--- CORRECT
// API_KEYS: api_key <--- INCORRECT

export enum DB_COLLECTION_NAMES {
  // A
  AUTH_CREDENTIALS = 'auth_credentials',

  //B
  BOOKINGS = 'bookings',
  BUSSES = 'busses',

  //C
  CLOCK_OUT_REASONS = 'clock_out_reasons',

  //I
  IP_ACL = 'ip_acl_lists',

  //L
  LEADS = 'leads',

  // O
  OBJECT_LISTS = 'object_lists',

  // R
  ROLES = 'roles',
  RESTAURANTS = 'restaurants',

  // S
  SETTINGS = 'settings',

  // T
  TRIPS = 'trips',

  // U
  USERS = 'users',
  UPLOAD = 'uploads',
}

// export const MongooseModules = [
//   {
//     name: DB_COLLECTION_NAMES.USERS,
//     schema: UserSchema,
//   },
//   {
//     name: DB_COLLECTION_NAMES.BOOKINGS,
//     schema: BookingSchema,
//   },
//   {
//     name: DB_COLLECTION_NAMES.BUSSES,
//     schema: BusSchema,
//   },
//   {
//     name: DB_COLLECTION_NAMES.TRIPS,
//     schema: TripSchema,
//   },
//   {
//     name: DB_COLLECTION_NAMES.RESTAURANTS,
//     schema: RestaurantSchema,
//   },
// ];
