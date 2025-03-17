import { Injectable, NestMiddleware } from '@nestjs/common';
import * as bodyParser from 'body-parser';

export function JsonBodyParserMiddlewareGenerator(limit: string) {
  @Injectable()
  class JSONBodyParserMiddleware implements NestMiddleware {
    use = bodyParser.json({ limit });
  }

  return JSONBodyParserMiddleware;
}
