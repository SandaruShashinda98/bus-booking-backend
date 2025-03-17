import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const validationErrors = exception.getResponse() as { message: string[] };
    const errorMessages = Array.isArray(validationErrors.message)
      ? validationErrors.message
      : [validationErrors.message];

    const formattedResponse = {
      message: [
        "We couldn't process your request due to invalid or missing information. Please try again.",
        ...errorMessages,
      ],
      error: 'Bad Request',
      statusCode: status,
    };

    response.status(status).json(formattedResponse);
  }
}
