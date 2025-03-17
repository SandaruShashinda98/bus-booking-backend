import { SYSTEM_CONFIG_KEYS } from '@constant/common/system-config-keys';

export default () => ({
  [SYSTEM_CONFIG_KEYS.PORT]: process.env.PORT,
});
