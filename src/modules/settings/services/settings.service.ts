import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { GetObjectListQueryDTO } from '@dto/settings/object-list-query-params.dto';
import { IObjectList } from '@interface/settings/object-list';
import { LIST_TYPE } from '@constant/settings/object-list';
import { ACTIVE_STATE } from '@constant/authorization/user';
import { IIpACLFilterCriteria } from '@interface/settings/general-settings';

@Injectable()
export class SettingsService {
  constructor() {}

  /**
   * This function generates filter criteria based on search key and ID for object-list
   */
  getObjectListFilters(queryParams: GetObjectListQueryDTO) {
    const { searchKey, _id } = queryParams;

    const filterCriteria: FilterQuery<GetObjectListQueryDTO> = {};

    filterCriteria.is_delete = false;

    if (searchKey) filterCriteria.role = { $regex: searchKey, $options: 'i' };

    if (_id) filterCriteria._id = new Types.ObjectId(_id);

    return filterCriteria;
  }

  /**
   * This function generates filter criteria based on search key and ID for ip-acl
   */
  getIpACLFilters(queryParams: IIpACLFilterCriteria) {
    const { ip_address, description, active_state, _id } = queryParams;

    const filterCriteria: FilterQuery<GetObjectListQueryDTO> = {};

    filterCriteria.is_delete = false;

    if (ip_address)
      filterCriteria.ip_address = { $regex: ip_address, $options: 'i' };
    if (description)
      filterCriteria.description = { $regex: description, $options: 'i' };

    if (active_state) {
      if (active_state === ACTIVE_STATE.ACTIVE) {
        filterCriteria.is_active = true;
      } else if (active_state === ACTIVE_STATE.DE_ACTIVE) {
        filterCriteria.is_active = false;
      } else {
        filterCriteria.is_active = { $in: [true, false] };
      }
    }

    if (_id) filterCriteria._id = new Types.ObjectId(_id);

    return filterCriteria;
  }

  /**
   * The function `getObjectsInsideSingleList` returns objects from a list based on the list type, with
   * a special case for fetching leads.
   */
  getObjectsInsideSingleList(list: IObjectList) {
    if (
      list.list_type === LIST_TYPE.COUNTRIES ||
      list.list_type === LIST_TYPE.CUSTOM
    ) {
      return list.objects;
    } else if (list.list_type === LIST_TYPE.LEADS) {
      // TODO: Fetch leads from the leads collection
      return null;
    }
    return null;
  }
}
