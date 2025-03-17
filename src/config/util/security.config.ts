import { SECURITY_CONFIG_KEYS } from '@constant/common/security-config-keys';

export default () => ({
  [SECURITY_CONFIG_KEYS.DDOS_DURATION]: 10,
  [SECURITY_CONFIG_KEYS.DDOS_ATTEMPTS]: 100,
});
