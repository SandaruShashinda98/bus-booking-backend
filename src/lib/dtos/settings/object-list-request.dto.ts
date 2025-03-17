import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { isValidCountry } from '@common/helpers/country.helper';
import { LIST_TYPE } from '@constant/settings/object-list';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { Types } from 'mongoose';

/*
 * custom decorator to validate the objects based on the list type
 */
function ValidateBasedOnListType(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'validateBasedOnListType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { object } = args;
          const listType = (object as any).list_type;

          if (!Array.isArray(value) || value.length === 0 || !listType)
            return false;

          const validators = {
            [LIST_TYPE.CUSTOM]: (v: any) => typeof v === 'string',
            [LIST_TYPE.COUNTRIES]: isValidCountry,
            [LIST_TYPE.LEADS]: (v: any) => Types.ObjectId.isValid(v),
          };

          return value.every(validators[listType]);
        },
        defaultMessage(args: ValidationArguments) {
          const { object } = args;
          const listType = (object as any).list_type;

          switch (listType) {
            case LIST_TYPE.CUSTOM:
              return 'Each custom object must be a string';
            case LIST_TYPE.COUNTRIES:
              return 'Each country must be a valid country object with name, code, image, checked,and dial_codes';
            case LIST_TYPE.LEADS:
              return 'Each lead must be a valid MongoDB ObjectId';
            default:
              return 'Invalid list type or objects';
          }
        },
      },
    });
  };
}

export class CreateObjectListDTO {
  @ApiProperty({
    example: true,
    description: 'Indicates if the role is active',
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @ApiProperty({
    example: 'true',
    description: 'cloned object-list or not',
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_clone: boolean;

  @ApiProperty({
    example: 'Call Again - General',
    description: 'name of the object-list',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: LIST_TYPE.CUSTOM,
    description: 'list type - CUSTOM/COUNTRIES/LEADS',
    type: String,
    enum: LIST_TYPE,
    required: true,
  })
  @IsEnum(LIST_TYPE)
  @IsNotEmpty()
  list_type: LIST_TYPE;

  @ApiProperty({
    example: ['item1', 'item2'],
    description: 'List of objects, varies by list type',
    isArray: true,
    type: String,
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Objects list cannot be empty' })
  @ValidateBasedOnListType()
  objects: string[];
}

export class UpdateObjectListDTO extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: 'Call Again - General',
    description: 'name of the object-list',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    example: 'true',
    description: 'cloned object-list or not',
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_clone: boolean;

  @ApiProperty({
    example: LIST_TYPE.CUSTOM,
    description: 'list type - CUSTOM/COUNTRIES/LEADS',
    type: String,
    enum: LIST_TYPE,
    required: false,
  })
  @IsEnum(LIST_TYPE)
  @IsOptional()
  list_type: LIST_TYPE;

  @ApiProperty({
    example: ['item1', 'item2'],
    description: 'List of objects, varies by list type',
    isArray: true,
    type: String,
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateBasedOnListType()
  objects: string[];
}
