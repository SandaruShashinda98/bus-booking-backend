import { PERMISSIONS } from '@constant/authorization/roles';
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PERMISSIONS[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
