import { GeneralCorsMiddleware } from '@common/middlewares/general-cors.middleware';
import { JsonBodyParserMiddlewareGenerator } from '@common/middlewares/json-body-parser.middleware';
import { UrlEncodedBodyParserMiddlewareGenerator } from '@common/middlewares/url-encoded-body-parser.middleware';
import { NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

export class AppMiddlewareModule implements NestModule {
  /**
   * The `configure` function sets up middleware for parsing JSON and URL-encoded bodies, as well as
   * handling CORS with specific exclusions for certain routes.
   * @param {MiddlewareConsumer} consumer - The `consumer` parameter in the `configure` function is an
   * instance of `MiddlewareConsumer` class. It is used to configure middleware for specific routes in
   * your application. In the provided code snippet, various middleware functions are being applied to
   * different routes using the `consumer.apply()` method.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JsonBodyParserMiddlewareGenerator('1024mb'))
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(UrlEncodedBodyParserMiddlewareGenerator('1024mb'))
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // cors
    // consumer
    //   .apply(GeneralCorsMiddleware)
    //   .exclude(
    //     // need to exclude the routes that uses custom origin middleware
    //     // need to specify routes one by one for this to work (regex does not work)

    //     // specify all the public endpoints below
    //     '/api/public/example-url',
    //   )
    //   .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
