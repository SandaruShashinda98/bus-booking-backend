import { LIST_TYPE } from '@constant/settings/object-list';
import { IBaseEntity } from '@interface/common/base-entity';
import { Types } from 'mongoose';

/*
@example - Example of an object list: countries
{
  name: "European Countries",
  list_type: LIST_TYPE.COUNTRIES,
  is_clone: false
  objects: [
    { name: "France", code: "FR", image: "france-flag.svg", dial_codes: ["+33"] },
    { name: "Germany", code: "DE", image: "germany-flag.svg", dial_codes: ["+49"] },
  ]
}

@example - Example of an object list: LEADS
{
  name: "Leads from 2021",
  list_type: LIST_TYPE.LEADS,
  is_clone: false
  objects: ["33bh3fe4by33b3", "3b3b3b3b3b3"]
}

@example - Example of an object list: CUSTOM
{
  name: "Custom List",
  list_type: LIST_TYPE.CUSTOM,
  is_clone: false
  objects: ["custom data 1", "custom data 2"]
}
*/
export interface IObjectList extends IBaseEntity {
  name: string;
  list_type: LIST_TYPE;
  is_clone: boolean;
  objects: string[] | Types.ObjectId[] | ICountry[];
}

export interface ICountry {
  name: string;
  code: string;
  image: string;
  checked: boolean;
  dial_codes: string[];
}
