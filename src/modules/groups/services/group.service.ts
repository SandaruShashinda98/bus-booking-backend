import { GetGroupQueryDTO } from '@dto/groups/group-query-params.dto';
import { IGroup } from '@interface/groups/groups';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class GroupService {
  constructor() {}

  /**
   * The function `getDesksOrSkillGroupFilters` generates filter criteria based on search key and ID for querying
   * desks or skill groups.
   */
  getDesksOrSkillGroupFilters(queryParams: GetGroupQueryDTO) {
    const { searchKey, _id } = queryParams;

    const filterCriteria: FilterQuery<GetGroupQueryDTO> = {};

    filterCriteria.is_delete = false;

    if (searchKey) filterCriteria.name = { $regex: searchKey, $options: 'i' };

    if (_id) filterCriteria._id = _id;

    return filterCriteria;
  }

  /**
   * The function `getGroupFilters` generates filter criteria based on search key and ID for querying
   * groups.
   */
  getGroupFilters(queryParams: GetGroupQueryDTO) {
    const { searchKey, _id } = queryParams;

    const filterCriteria: FilterQuery<GetGroupQueryDTO> = {};

    filterCriteria.is_delete = false;

    if (searchKey) {
      const regex = new RegExp(searchKey, 'i');
      filterCriteria.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    if (_id) filterCriteria._id = _id;

    return filterCriteria;
  }

  getGroupCheckExistence(body: Pick<IGroup, 'name' | '_id'>) {
    const { name, _id } = body;

    const filterCriteria: FilterQuery<any> = {};
    filterCriteria.is_delete = false;

    if (_id) filterCriteria._id = { $ne: _id };
    if (name) filterCriteria.name = name.trim();

    return filterCriteria;
  }
}
