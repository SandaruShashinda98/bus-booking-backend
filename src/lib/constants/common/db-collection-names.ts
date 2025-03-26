// Always use plural values
// API_KEYS: api_keys <--- CORRECT
// API_KEYS: api_key <--- INCORRECT

export enum DB_COLLECTION_NAMES {
  // A
  AUTH_CREDENTIALS = 'auth_credentials',

  //B
  BOOKINGS = 'bookings',
  BUSSES = 'busses',
  BUS_STAFF = 'bus_staffs',

  //C
  CLOCK_OUT_REASONS = 'clock_out_reasons',

  //I
  IP_ACL = 'ip_acl_lists',

  //L
  LEADS = 'leads',

  //
  MENUS = 'menus',

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
