import { SYSTEM_CONFIG_KEYS } from '@constant/common/system-config-keys';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class GeneralCorsMiddleware implements NestMiddleware {
  private allowedOrigins: RegExp[] = [];

  constructor(configService: ConfigService) {
    const origin = configService.get(SYSTEM_CONFIG_KEYS.PORT);
    if (origin) {
      const escapedDomain = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexPattern = `^http(s)?://.*?${escapedDomain}$`;
      const regexp = new RegExp(regexPattern);
      this.allowedOrigins.push(regexp);
    }
  }

  /**
   * The function `isAllowedOrigin` checks if a given origin matches any of the allowed origins specified
   * by regular expressions.
   * @param {string} origin - Origin is a string representing the URL of the requesting client.
   * @returns The `isAllowedOrigin` method returns a boolean value indicating whether the provided
   * `origin` string matches any of the regular expressions in the `allowedOrigins` array.
   */
  private isAllowedOrigin(origin: string): boolean {
    return this.allowedOrigins.some((regexString) => {
      const regex = new RegExp(regexString);
      return regex.test(origin);
    });
  }

  /**
   * The function sets up CORS headers for incoming requests and handles preflight OPTIONS requests.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    const requestOrigin = req.headers.origin;

    if (requestOrigin && this.isAllowedOrigin(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE',
    );

    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization, client-id, client-secret, client-data',
    );

    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  }
}
