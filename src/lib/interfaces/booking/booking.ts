import { IBaseEntity } from "@interface/common/base-entity";

export interface IBooking extends IBaseEntity {
  reason: string;
}
