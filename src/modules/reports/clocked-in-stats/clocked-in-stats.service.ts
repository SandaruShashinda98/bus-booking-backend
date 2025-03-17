import { paginator } from '@common/helpers/custom.helper';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IUserModel } from '@module/users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
@Injectable()
export class ClockedInService {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.USERS)
    private readonly userModel: Model<IUserModel>,
  ) {}

  getClockedInFilters(filters: any): {
    filterCriteria: FilterQuery<any>;
    deskIdsArray: Types.ObjectId[];
    skillGroupsIdsArray: Types.ObjectId[];
  } {
    const filterCriteria: FilterQuery<any> = {};
    let deskIdsArray = [];
    let skillGroupsIdsArray = [];

    filterCriteria.is_delete = false;

    // add user id array to filter
    if (filters?.filter?.userIds && filters?.filter?.userIds?.length > 0) {
      const userIdsArray = filters?.filter?.userIds.map(
        (userId: string) => new Types.ObjectId(userId),
      );
      filterCriteria._id = { $in: userIdsArray };
    }
    // desk id array
    if (filters?.filter?.deskIds && filters?.filter?.deskIds?.length > 0)
      deskIdsArray = filters?.filter?.deskIds.map(
        (deskId: string) => new Types.ObjectId(deskId),
      );

    // skill group id array
    if (
      filters?.filter?.skillGroupIds &&
      filters?.filter?.skillGroupIds?.length > 0
    )
      skillGroupsIdsArray = filters?.filter?.skillGroupIds.map(
        (skillGroupId: string) => new Types.ObjectId(skillGroupId),
      );

    return { filterCriteria, deskIdsArray, skillGroupsIdsArray };
  }

  async filterUserClockedInStats(
    filters: any,
    skip: number = 0,
    limit: number = 10,
  ) {
    const {
      filterCriteria,
      deskIdsArray = [],
      skillGroupsIdsArray = [],
    } = this.getClockedInFilters(filters);

    const pipeline: PipelineStage[] = [{ $match: filterCriteria }];

    // Look up users in desks and skill groups
    if (deskIdsArray?.length || skillGroupsIdsArray?.length) {
      if (deskIdsArray?.length) {
        pipeline.push(
          {
            $lookup: {
              from: 'desks',
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $in: ['$$userId', '$users'] },
                        {
                          $in: ['$_id', deskIdsArray],
                        },
                      ],
                    },
                  },
                },
              ],
              as: 'matchingDesks',
            },
          },
          {
            $match: {
              matchingDesks: { $ne: [] },
            },
          },
        );
      }

      if (skillGroupsIdsArray?.length) {
        pipeline.push(
          {
            $lookup: {
              from: 'skill_groups',
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $in: ['$$userId', '$users'] },
                        {
                          $in: ['$_id', skillGroupsIdsArray],
                        },
                      ],
                    },
                  },
                },
              ],
              as: 'matchingSkillGroups',
            },
          },
          {
            $match: {
              matchingSkillGroups: { $ne: [] },
            },
          },
        );
      }
    }

    // pagination
    pipeline.push(...paginator(skip, limit));

    // projection
    pipeline.push({
      $project: {
        first_name: 1,
        last_name: 1,
        username: 1,
        total_logged_in_time: '62h 48m 38s',
        total_clocked_in_time: '39h 23m 34s',
        total_clocked_in_count: '74',
        total_breaks_in_time: '19h 03m 38s',
        start_shift_count: '6',
        start_shift_time: '5m 32s',
        break_duration_system: '7',
        break_duration_system_time: '12m 32s',
        reasons_count: '5',
      },
    });

    pipeline.push({
      $facet: {
        data: [],
        count: [{ $count: 'total' }],
      },
    });

    const result = await this.userModel.aggregate(pipeline);

    return {
      data: result[0].data ?? [],
      count: result[0].count[0] ? result[0].count[0].total : 0,
    };
  }

  filterBreakdownReasons(): any {
    const reasonArray = [
      {
        _id: 1,
        reason: 'Taking a walk',
        count: 6,
        time: '5m 32s',
      },
      {
        _id: 2,
        reason: 'Lunch Break',
        count: 10,
        time: '50m 32s',
      },
      {
        _id: 3,
        reason: 'Personal',
        count: 6,
        time: '5m 32s',
      },
      {
        _id: 4,
        reason: 'Emergency',
        count: 3,
        time: '15m 32s',
      },
      {
        _id: 5,
        reason: 'Business Meeting',
      },
    ];
    return {
      data: reasonArray,
      count: reasonArray.length,
    };
  }
}
