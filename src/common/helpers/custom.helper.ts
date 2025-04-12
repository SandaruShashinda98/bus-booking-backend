import { Types } from 'mongoose';

export function responseOrderMaker(
  start: number,
  size: number,
  data: any[],
  count: number,
) {
  if (data.length === 0) return [];
  // Calculate the actual starting index based on start and data length
  const startingIndex = count - (start - 1) * size;

  const responseData = data.map((item, index) => {
    return {
      ...item,
      index: startingIndex - index,
    };
  });

  return responseData;
}

export function paginator(skip: number, limit: number) {
  const _skip = skip && limit ? (skip - 1) * limit : 0;
  const pagination = limit > 0 ? [{ $skip: _skip }, { $limit: limit }] : [];
  return pagination;
}

export function dateTimeFormatter(dateObject: Date): {
  date: string;
  time: string;
} {
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatTime = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const offset = -date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);
    const offsetSign = offset >= 0 ? '+' : '-';
    return `${hh}:${mm}:${ss} - (GMT ${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')})`;
  };

  return {
    date: formatDate(dateObject),
    time: formatTime(dateObject),
  };
}

/**
 *  This function creates a set Object for Mongodb preventing the need for more database calls from the API and recreating the object.
 * Please not this function is only valid for one depth of objects within an object. If depth more than one level is required,
 * modify this code to a recursive function to traverse the object
 * @param updateData This function takes any type of object as its parameter can creates a suitable object
 * @returns This function returns an object that is suitable for the set operation in mongodb
 */
export function createMongoSetObjectForEntitiesWithObjects(updateData: any) {
  return Object.entries(updateData).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        acc[`${key}.${nestedKey}`] = nestedValue;
      });
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function phoneFilterFormatter(phone_number: string) {
  const escapeRegex = (string: string) =>
    string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  const cleanedPhone = phone_number.replace(/[^\d+x()-.\s]/g, '').trim();

  return escapeRegex(cleanedPhone);
}

export function convertToIdArray(stringArray: string[]) {
  if (!Array.isArray(stringArray) || stringArray?.length === 0) {
    return [];
  } else {
    return stringArray.map((id) => new Types.ObjectId(id));
  }
}

export function regexStringFilter(stringValue: string) {
  return {
    $regex: stringValue,
    $options: 'i',
  };
}

export function regexPhoneNumberFilter(stringValue: string) {
  return {
    $regex: phoneFilterFormatter(stringValue),
    $options: 'i',
  };
}

export const cleanEmptyValues = (obj: any): any => {
  // Handle null/undefined
  if (obj === null || obj === undefined) return undefined;

  // Handle primitives
  if (typeof obj !== 'object') {
    // Return undefined for empty strings, otherwise return the value
    return obj === '' ? undefined : obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map((item) => cleanEmptyValues(item))
      .filter((item) => item !== undefined);

    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  // Handle objects
  const cleanedObj = {};
  let hasValidProperties = false;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const cleanedValue = cleanEmptyValues(obj[key]);

      // Only add the property if it has a valid value
      if (cleanedValue !== undefined) {
        cleanedObj[key] = cleanedValue;
        hasValidProperties = true;
      }
    }
  }

  return hasValidProperties ? cleanedObj : undefined;
};

// Function to count all fields in an object, counting arrays as single fields
export const countObjectFields = (obj: any): number => {
  // Return 0 for null/undefined
  if (obj === null || obj === undefined) return 0;

  // Return 1 for primitives (non-objects)
  if (typeof obj !== 'object') return 1;

  // Handle arrays - count as 1 field if not empty
  if (Array.isArray(obj)) {
    return obj.length > 0 ? 1 : 0;
  }

  // Handle objects
  let fieldCount = 0;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          // For nested objects or arrays, count their fields
          fieldCount += countObjectFields(value);
        } else {
          // For primitives, count as 1
          fieldCount += 1;
        }
      }
    }
  }

  return fieldCount;
};


export function generateBookingID() {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const time =
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0');

  // Format: BK-MM-DD-HHMM
  return `BK-${month}-${day}-${time}`;
}