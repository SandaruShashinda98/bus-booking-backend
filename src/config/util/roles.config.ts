import { PERMISSIONS } from '@constant/authorization/roles';

export const DEFINITE_ROLES = ['Admin', 'Agent', 'Support'];

export const ROLE_PERMISSIONS = {
  Admin: { cannot_modify: true, permissions: [PERMISSIONS.ADMIN] },
  Agent: { cannot_modify: true, permissions: [PERMISSIONS.AGENT] },
  Support: { cannot_modify: true, permissions: [PERMISSIONS.SUPPORT] },
};
