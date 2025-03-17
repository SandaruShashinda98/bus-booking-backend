import { Injectable, NestMiddleware } from '@nestjs/common';
import * as bodyParser from 'body-parser';

export function UrlEncodedBodyParserMiddlewareGenerator(limit: string) {
  @Injectable()
  class URLEncodedBodyParserMiddleware implements NestMiddleware {
    use = bodyParser.urlencoded({ limit, extended: true });
  }

  return URLEncodedBodyParserMiddleware;
}
