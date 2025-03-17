import { ACTIVITY_TYPES } from "@constant/activity/activity";
import { Types } from "mongoose";

export interface IActivity {
    user_id: Types.ObjectId;
    activity_type? : ACTIVITY_TYPES;
}