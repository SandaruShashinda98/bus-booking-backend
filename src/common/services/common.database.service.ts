import {
  FilterQuery,
  Model,
  PopulateOptions,
  QueryOptions,
  Types,
  Document,
  PipelineStage,
} from 'mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBaseEntity } from '@interface/common/base-entity';
import { paginator, responseOrderMaker } from '@common/helpers/custom.helper';
import { CommonResponse } from './response.service';

export abstract class CommonDatabaseService<T extends IBaseEntity> {
  constructor(
    private readonly mongooseModel: Model<T & Document>,
    private readonly model: DB_COLLECTION_NAMES,
  ) {}

  async addNewDocument(
    doc: T,
    populate: string | PopulateOptions | (string | PopulateOptions)[] = [],
  ): Promise<T> {
    const newDoc = await this.mongooseModel.create({
      ...doc,
      changed_by: doc?.changed_by,
    });

    newDoc.populate(populate);
    const newDocOnDb: T = newDoc.toObject() as T;

    return newDocOnDb;
  }

  async updateDocument(
    doc: T,
    populate: string | PopulateOptions | (string | PopulateOptions)[] = [],
    filter: FilterQuery<T> = { _id: doc._id },
  ): Promise<T> {
    // set the last_modified_on with current time
    const newDoc: T = {
      ...doc,
      last_modified_on: new Date(),
      changed_by: doc?.changed_by,
    };

    const newDocOnDb = await this.mongooseModel
      .findOneAndUpdate(filter, newDoc, { new: true })
      .exec();

    return (await newDocOnDb.populate(populate)).toObject();
  }

  async filterDocumentsWithPagination(
    filters: FilterQuery<T>,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ data: T[]; count: number }> {
    const aggregationPipeline: PipelineStage[] = [
      { $match: filters },
      {
        $facet: {
          data: [{ $sort: { created_on: -1 } }],
          count: [{ $count: 'total' }],
        },
      },
      {
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$count.total', 0] }, // Safely extract the count or return 0 if undefined
        },
      },
    ];

    const result = await this.mongooseModel.aggregate(aggregationPipeline);

    // Return the data and count in the common format
    return {
      data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
      count: result[0].count || 0,
    };
  }

  async filterSearchData(
    filters: FilterQuery<T>,
    skip: number = 0,
    limit: number = 10,
    db_field: string = '$name',
  ): Promise<CommonResponse<{ id: string; name: string }[]>> {
    const aggregationPipeline: PipelineStage[] = [
      { $match: filters },
      {
        $facet: {
          data: [
            ...paginator(skip, limit),
            {
              $project: {
                id: '$_id',
                name: db_field,
                _id: 0,
              },
            },
          ],
          count: [{ $count: 'total' }],
        },
      },
      {
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$count.total', 0] },
        },
      },
    ];

    const result = await this.mongooseModel.aggregate(aggregationPipeline);

    // Return the data and count in the common format
    return { data: result[0].data ?? [], count: result[0].count || 0 };
  }

  async filterDocuments(
    filter: FilterQuery<T> = {},
    options: QueryOptions<T> = {},
  ): Promise<T[]> {
    return this.mongooseModel
      .find(filter, {}, { lean: true, ...options })
      .sort({ created_on: 'desc' })
      .exec();
  }

  async findDocument(
    filter: FilterQuery<T> = {},
    options: QueryOptions<T> = {},
  ): Promise<T | null> {
    return (
      await this.mongooseModel.findOne(filter, {}, options)?.exec()
    )?.toObject() as T | null;
  }

  async findById(id: Types.ObjectId | string): Promise<T | null> {
    const doc = (await this.mongooseModel.findById(id)?.exec())?.toObject();

    if (!doc) return null;

    return doc as T;
  }

  // use only for special purposes
  async hardDelete(id: Types.ObjectId | string): Promise<T | null> {
    const doc = (
      await this.mongooseModel.findByIdAndDelete(id)?.exec()
    )?.toObject();

    if (!doc) return null;

    return doc as T;
  }

  // Perform the bulk delete operation
  async bulkHardDelete(
    ids: Types.ObjectId[],
  ): Promise<{ deletedCount: number } | null> {
    const result = await this.mongooseModel
      .deleteMany({
        _id: { $in: ids },
      })
      .exec();

    if (!result) return null;

    return { deletedCount: result.deletedCount || 0 };
  }

  // Delete documents that match the given filter criteria
  async filterAndDelete<T>(
    filter: FilterQuery<T>,
  ): Promise<{ deletedCount: number } | null> {
    try {
      const result = await this.mongooseModel.deleteMany(filter).exec();

      if (!result) return null;

      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      throw new Error(`Failed to perform filtered delete: ${error.message}`);
    }
  }

  async getEntriesCount(filters?: {}): Promise<number> {
    const aggregationResult = await this.mongooseModel
      .aggregate([
        {
          $match: filters ?? {},
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    if (aggregationResult.length > 0) {
      return aggregationResult[0].count;
    } else {
      return 0;
    }
  }
}
