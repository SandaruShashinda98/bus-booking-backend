export enum ENTITY_TYPES {
  USER = 'user',
  ROLE = 'role',
  GROUP = 'group',
  DESK = 'desk',
  SKILL_GROUP = 'skill_group',
  LEAD = 'lead',
  LEAD_CAMPAIGN = 'lead_campaign',
  LEAD_STATUS = 'lead_status',
  LEAD_COMMENT = 'lead_comment',
  UPLOAD = 'upload',
  SETTINGS = 'settings',
}

export enum WS_EVENTS {
  CREATED = 'entity:created',
  UPDATED = 'entity:updated',
  DELETED = 'entity:deleted',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  NOTIFICATION = 'notification',
}
