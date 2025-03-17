import { GetClockOutReasonQueryDTO } from '@dto/references/clock-out-query-param';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class ReferenceService {
  constructor() {}

  /**
   * This function generates filter criteria based on search key and ID for clock out
   * reasons.
   */
  getClockOutFilters(queryParams: GetClockOutReasonQueryDTO) {
    const { searchKey, _id } = queryParams;

    const filterCriteria: FilterQuery<GetClockOutReasonQueryDTO> = {};

    filterCriteria.is_delete = false;

    //TODO: depends on the permission
    // filterCriteria.is_active = true;

    if (searchKey) filterCriteria.reason = { $regex: searchKey, $options: 'i' };

    if (_id) filterCriteria._id = _id;

    return filterCriteria;
  }
}
