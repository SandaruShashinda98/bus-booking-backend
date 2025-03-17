import { IModification } from '@interface/activity-log/activity-log';
import { isValidObjectId, Types } from 'mongoose';

const blockedKeys = [
  '_id',
  '_doc',
  '$__',
  '$op',
  '$init',
  '$locals',
  '_v',
  'v',
  '__v',
  'errors',
  'last_modified_on',
];

interface KeyValuePair {
  _id?: Types.ObjectId;
  key: string;
  value: string | number | Date;
}

/**
 * The function `_deconstruct` recursively breaks down a given value into key-value pairs, handling
 * various data types and structures.
 * @param {any} value - The `value` parameter in the `_deconstruct` function is the data that you want
 * to deconstruct into key-value pairs. It can be of any type - object, array, string, number, etc. The
 * function recursively breaks down the value into key-value pairs based on its type and structure
 * @param {string} [key] - The `key` parameter is a string that represents the key of the current
 * object property being deconstructed. It is optional and is used to build the nested key structure
 * for nested objects or arrays. If not provided, it defaults to an empty string.
 * @param {KeyValuePair[]} keyValuePairs - The `keyValuePairs` parameter is an array of objects with
 * key-value pairs. Each object in the array represents a key-value pair extracted from the input
 * `value`. The function `_deconstruct` recursively deconstructs the input `value` and populates this
 * array with the extracted key-value pairs.
 * @returns The function `_deconstruct` returns an array of `KeyValuePair` objects.
 */
const _deconstruct = (
  value: any,
  key?: string,
  keyValuePairs: KeyValuePair[] = [],
): KeyValuePair[] => {
  if (!value && value !== false) {
    return keyValuePairs;
  } else if (
    (value.toString().length === 24 && isValidObjectId(value)) ||
    value.toDateString
  ) {
    keyValuePairs.push({ key: key || '', value });
    return keyValuePairs;
  } else if (Array.isArray(value)) {
    const deconstructed: KeyValuePair[] = [];

    value.forEach((_value, i) => {
      const newKey = key ? `${key}.${i}` : i.toString();
      const _deconstructed = _deconstruct(_value, newKey);
      deconstructed.push(..._deconstructed);
    });
    return deconstructed;
  } else if (value.toObject || typeof value === 'object') {
    const keys = Object.keys(value.toObject ? value.toObject() : value);
    const values = Object.values(value.toObject ? value.toObject() : value);
    const deconstructed: KeyValuePair[] = [];

    keys.forEach((_key, i) => {
      if (!blockedKeys.includes(_key)) {
        const newKey = `${key ? key + '.' : ''}${_key}`;
        const _deconstructed = _deconstruct(values[i], newKey);

        deconstructed.push(..._deconstructed);
      }
    });
    return deconstructed;
  }
  keyValuePairs.push({ key: key || '', value });
  return keyValuePairs;
};

/**
 * The `deconstruct` function takes an object as input, deconstructs it into key-value pairs, and
 * returns a new object with string, number, or Date values.
 * @param {unknown} object - The `object` parameter in the `deconstruct` function is of type `unknown`,
 * which means it can be any type. The function is designed to deconstruct this object into a new
 * object where the keys are strings and the values are either strings, numbers, or Date objects.
 * @returns The `deconstruct` function returns an object where each key is a string and each value is
 * either a string, number, or Date.
 */
const deconstruct = (
  object: unknown,
): { [key: string]: string | number | Date } => {
  const deconstructed = _deconstruct(object);
  const finalObject = {};

  deconstructed.forEach((e) => {
    finalObject[e.key] = e.value;
  });

  return finalObject;
};

/**
 * The `detectModifications` function compares two objects and returns an array of modifications
 * between them.
 * @param {unknown} _newObject - The `_newObject` parameter in the `detectModifications` function
 * represents the new object that you want to compare for modifications. It is of type `unknown`, which
 * means it can be any type of object.
 * @param {unknown} [_oldObject] - The `_oldObject` parameter in the `detectModifications` function is
 * an optional parameter that represents the old object or data that you want to compare with the new
 * object or data to detect modifications. If provided, the function will compare the properties of the
 * old object with the properties of the new object.
 * @returns The `detectModifications` function returns an array of `IModification` objects, which
 * represent the changes between the new and old objects passed as arguments to the function. Each
 * `IModification` object contains the field name that was modified, the old value of that field (if it
 * existed in the old object), and the new value of that field.
 */
export function detectModifications(
  _newObject: unknown,
  _oldObject?: unknown,
): IModification[] {
  const newObject = _newObject ? deconstruct(_newObject) : {};
  const oldObject = _oldObject ? deconstruct(_oldObject) : {};

  const newKeys = Object.keys(newObject);
  const oldKeys = Object.keys(oldObject);
  const keys: string[] = Array.from(new Set([...newKeys, ...oldKeys]));

  const changes: IModification[] = [];

  keys.forEach((key) => {
    if (
      !oldObject[key] ||
      !newObject[key] ||
      oldObject[key].toString() !== newObject[key].toString()
    ) {
      changes.push({
        field_name: key,
        old_value: oldObject[key]?.toString() || '',
        new_value: newObject[key]?.toString() || '',
      });
    }
  });

  return changes;
}
