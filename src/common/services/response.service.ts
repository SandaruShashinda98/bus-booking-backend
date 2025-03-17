import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';

export interface PaginatedResponse {
  results: any[];
  count: [{ count: number }] | [];
}

export interface CommonResponse<T> {
  data: T[];
  count: [{ count: number }] | [];
}

@Injectable()
export class ResponseService {
  paginatedResults(result: PaginatedResponse): {
    data: any;
    count: number;
  } {
    return {
      data: result.results,
      count: result.count[0]?.count ?? 0,
    };
  }
}
