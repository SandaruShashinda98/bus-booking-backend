import { SECURITY_CONFIG_KEYS } from '@constant/common/security-config-keys';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  /**
   * The function `createThrottlerOptions` asynchronously creates ThrottlerModuleOptions based on
   * security setup configuration.
   * @returns The `createThrottlerOptions` function returns an object with a `throttlers` property
   * containing an array of objects. The contents of the array depend on the `securitySetup`
   * configuration:
   */
  async createThrottlerOptions(): Promise<ThrottlerModuleOptions> {
    const securitySetup = {
      ddos_attack_protection: true,
      ddos_duration: this.configService.get(SECURITY_CONFIG_KEYS.DDOS_DURATION),
      ddos_attempts: this.configService.get(SECURITY_CONFIG_KEYS.DDOS_ATTEMPTS),
    };

    if (!securitySetup) {
      return {
        throttlers: [
          {
            ttl:
              this.configService.get(SECURITY_CONFIG_KEYS.DDOS_DURATION) || 0,
            limit:
              this.configService.get(SECURITY_CONFIG_KEYS.DDOS_ATTEMPTS) || 0,
          },
        ],
      };
    }

    if (securitySetup.ddos_attack_protection) {
      return {
        throttlers: [
          {
            ttl: securitySetup.ddos_duration || 0,
            limit: securitySetup.ddos_attempts || 0,
          },
        ],
      };
    }

    return {
      throttlers: [
        {
          ttl: 0,
          limit: 0,
        },
      ],
      ignoreUserAgents: [/(.*?)/],
    };
  }
}
