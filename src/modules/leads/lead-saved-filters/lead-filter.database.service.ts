import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ILeadFilter } from '@interface/leads/leads';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ILeadEntityFilterModel } from './lead-filter.schema';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { countObjectFields } from '@common/helpers/custom.helper';
import { ILoggedUser } from '@interface/authorization/user';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { GetLeadFilterEntityQueryDTO } from '@dto/leads/leads-entities-filter-query-params.dto';

@Injectable()
export class LeadsFilterDatabaseService extends CommonDatabaseService<ILeadFilter> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.LEAD_ENTITY_FILTERS)
    readonly leadFiltersModel: Model<ILeadEntityFilterModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(
      logsDatabaseService,
      leadFiltersModel,
      DB_COLLECTION_NAMES.LEAD_ENTITY_FILTERS,
    );
  }

  /**
   * This function generates filter criteria based on search key and ID for lead filters
   */
  getLeadEntityFilterFilters(queryParams: GetLeadFilterEntityQueryDTO) {
    const { searchKey, _id } = queryParams;

    const filterCriteria: FilterQuery<GetLeadFilterEntityQueryDTO> = {};

    filterCriteria.is_delete = false;

    if (searchKey)
      filterCriteria.filter_name = { $regex: searchKey, $options: 'i' };

    if (_id) filterCriteria._id = new Types.ObjectId(_id);

    return filterCriteria;
  }

  /*
   * This function creates a new lead filter with the given data.
   */
  async createNewLeadFilter(
    leadFilterData: Partial<ILeadFilter>,
    loggedUser?: ILoggedUser,
  ): Promise<ILeadFilter | null> {
    try {
      const newLeadFilter = new this.leadFiltersModel({
        ...leadFilterData,
        count: countObjectFields(leadFilterData) - 1, // -1 for removing the filter name from count
        created_by: loggedUser?._id,
        is_active: leadFilterData.is_active ?? true,
      });

      const savedLeadFilter = await newLeadFilter.save();

      return savedLeadFilter.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `lead-filter-database-service.ts -> createNewLeadFilter -> ${err}`,
        'DEBUG',
      );

      return null;
    }
  }

  /**
   * This function finds a single lead filter by its id and update with given data
   */
  async findLeadFilterByIdAndUpdate(
    id: string,
    updateData: Partial<ILeadFilter>,
  ): Promise<ILeadFilter | null> {
    try {
      const updatedLeadFilter = await this.leadFiltersModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true,
          runValidators: true,
          lean: true,
        },
      );

      return updatedLeadFilter;
    } catch (err) {
      new Logger().debug(
        `lead-filter.database.service.ts -> findLeadFilterByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  // to bulk delete lead saved filters
  async deleteBulkLeadFilters(multiDeleteLeadFilter: {
    is_delete_all: boolean;
    selected_filters: string[];
  }) {
    try {
      let deletedData: any;
      if (multiDeleteLeadFilter.is_delete_all) {
        deletedData = await this.filterAndDelete({});
      }

      if (
        !multiDeleteLeadFilter.is_delete_all &&
        multiDeleteLeadFilter.selected_filters?.length > 0
      ) {
        const filterIds = multiDeleteLeadFilter.selected_filters.map(
          (id) => new Types.ObjectId(id),
        );

        deletedData = await this.bulkHardDelete(filterIds);
      }

      return { data: deletedData };
    } catch (e) {
      throw new UnprocessableEntityException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }
}
