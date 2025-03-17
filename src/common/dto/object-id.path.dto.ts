import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationOptions, registerDecorator } from 'class-validator';
import { isValidObjectId } from 'mongoose';

/**
 * The IsObjectID function is a TypeScript decorator used for validating whether a property is a valid
 * mongoose.Types.ObjectID.
 * @returns The `IsObjectID` function returns a decorator function that can be used to validate whether
 * a property in a class is a valid mongoose.Types.ObjectID. The decorator registers a custom
 * validation decorator using the provided options and validation options. The validation logic checks
 * if the value is a valid ObjectID based on the specified conditions.
 */
export function IsObjectID(
  options?: { optional?: boolean; each?: boolean },
  validationOptions?: ValidationOptions,
) {
  return function (targetClass: any, propertyName: string) {
    registerDecorator({
      name: 'IsObjectID',
      target: targetClass.constructor,
      propertyName,
      constraints: [],
      options: {
        message: `${propertyName} should be a string of a valid mongoose.Types.ObjectID`,
        ...validationOptions,
      },
      validator: {
        validate(value: string | string[]) {
          // can return a Promise<boolean> here as well, if want to make async validation
          if (options?.optional && !value) {
            return true;
          }

          if (options?.each) {
            return (
              Array.isArray(value) && value.every((id) => isValidObjectId(id))
            );
          }

          return isValidObjectId(value);
        },
      },
    });
  };
}

/**
 * The function `ObjectIDPathParamDecorator` is a TypeScript decorator that generates API documentation
 * and validation for object ID path parameters.
 * @param {string} name - The `name` parameter is a string that represents the name of the path
 * parameter being decorated.
 * @param [objectIfOfWhat=the main document] - The `objectIfOfWhat` parameter is a string that
 * specifies the context or description of the object for which the Object ID is being used. In the
 * provided code snippet, it is used to generate the description for the API property related to the
 * Object ID path parameter.
 */
export const ObjectIDPathParamDecorator = (
  name: string,
  objectIfOfWhat = 'the main document',
) =>
  applyDecorators(
    ApiProperty({
      name,
      description: `Object id of ${objectIfOfWhat}`,
      required: true,
    }),
    IsObjectID(
      { optional: false },
      {
        message: `Path parameter "${name}" should be a string of a valid mongoose.Types.ObjectID`,
      },
    ) as PropertyDecorator,
  );

export class ObjectIDPathDTO {
  @ObjectIDPathParamDecorator('id')
  id: string;
}
