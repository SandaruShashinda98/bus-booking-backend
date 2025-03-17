import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateException extends HttpException {
  constructor(specificMessage: string[]) {
    const errorResponse = {
      message: specificMessage ?? ['Duplicate entities'],
      error: 'Conflict',
      statusCode: HttpStatus.CONFLICT,
    };
    super(errorResponse, HttpStatus.CONFLICT);
  }
}
