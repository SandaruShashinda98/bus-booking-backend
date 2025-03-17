import { regexStringFilter } from '@common/helpers/custom.helper';
import { GetTrunksFilterQuery } from '@dto/settings/trunks-request.dto';
import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';

@Injectable()
export class TrunksService {
  constructor() {}

  getTrunksFilters(
    filters: GetTrunksFilterQuery,
  ): FilterQuery<GetTrunksFilterQuery> {
    const filter: FilterQuery<GetTrunksFilterQuery> = {
      is_delete: false,
    };

    filters.searchKey
      ? (filter.name = regexStringFilter(filters.searchKey))
      : null;

    return filter;
  }

  getTrunkFilterForName(name: string, id?: string) {
    if (id) {
      return { name, is_delete: false, _id: { $ne: new Types.ObjectId(id) } };
    } else {
      return { name, is_delete: false };
    }
  }
}
