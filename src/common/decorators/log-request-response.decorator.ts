import { SetMetadata } from '@nestjs/common';

export const LOG_REQUEST_KEY = 'logRequest';
export const LOG_RESPONSE_KEY = 'logResponse';

// for request logging
export const LogRequest = (customText?: string) =>
  SetMetadata(LOG_REQUEST_KEY, { enabled: true, customText });

// for response logging
export const LogResponse = (customText?: string) =>
  SetMetadata(LOG_RESPONSE_KEY, { enabled: true, customText });
