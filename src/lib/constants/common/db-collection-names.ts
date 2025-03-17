// Always use plural values
// API_KEYS: api_keys <--- CORRECT
// API_KEYS: api_key <--- INCORRECT

export enum DB_COLLECTION_NAMES {
  // A
  AUTH_CREDENTIALS = 'auth_credentials',
  ACTIVITY = 'activity',

  //C
  CLOCK_OUT_REASONS = 'clock_out_reasons',
  CALLS = 'calls',
  // D
  DESKS = 'desks_v2',

  //G
  GROUPS = 'groups_v2',

  //I
  IP_ACL = 'ip_acl_lists',

  // L
  LEADS = 'leads',
  LEAD_CAMPAIGN = 'lead_campaign',
  LEAD_COMMENTS = 'lead_comments',
  LEAD_ENTITY_FILTERS = 'lead_entity_filters',
  LEAD_FILES = 'lead_files',
  LEAD_DENY_LIST = 'lead_deny_lists',
  LEAD_STATUS = 'lead_status',
  LOGS = 'logs',

  // O
  OBJECT_LISTS = 'object_lists',

  // R
  ROLES = 'roles',

  // S
  SKILL_GROUPS = 'skill_groups_v2',
  SETTINGS = 'settings',

  // T
  TRUNKS = 'trunks',

  // U
  USERS = 'users',
  UPLOAD = 'uploads',
  USER_GROUPS = 'user_groups',
}
