export enum LOG_ACTIONS {
  // BASIC ACTIONS
  BASIC_ADD_DOCUMENT = 'BASIC_ADD_DOCUMENT',
  BASIC_UPDATE_DOCUMENT = 'BASIC_UPDATE_DOCUMENT',
  BASIC_DELETE_DOCUMENT = 'BASIC_DELETE_DOCUMENT',
  BASIC_RESTORE_DOCUMENT = 'BASIC_RESTORE_DOCUMENT',
  BASIC_ROLE_BACK = 'BASIC_ROLE_BACK',
  BASIC_DELETE_MULTIPLE_DOCUMENTS = 'BASIC_DELETE_MULTIPLE_DOCUMENTS',

  // AUTHENTICATION SPECIFIC ACTIONS
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED',
  AUTH_REPLAY_ATTACK_ATTEMPT = 'AUTH_REPLAY_ATTACK_ATTEMPT',
  AUTH_LOGGED_OUT = 'AUTH_LOGGED_OUT',
}
