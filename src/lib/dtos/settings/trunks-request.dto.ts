import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { GetCommonQueryDTO } from '@common/dto/common-query.dto';
import { isValidCountry } from '@common/helpers/country.helper';
import { TRUNK_STATE } from '@constant/settings/trunks';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function ValidateCountriesArray(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'validateCountriesArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) {
            return false;
          }
          return value.every(isValidCountry);
        },
        defaultMessage() {
          return 'Each country must be a valid country object with name, code, image, checked, and dial_codes';
        },
      },
    });
  };
}


export class GetTrunksFilterQuery extends GetCommonQueryDTO {}

export class CreateTrunkRequestBodyDto {
  @ApiProperty({ example: 'New Trunk', description: 'The name of the trunk' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '#EEDD122213550048320',
    description: 'The URI value associated with the trunk',
  })
  @IsString()
  uri: string;

  @ApiProperty({
    description:
      'The state of the trunk, which can be one of the following values: Primary, Backup Failover, Disabled',
    enum: TRUNK_STATE,
  })
  @IsEnum(TRUNK_STATE)
  state: TRUNK_STATE;

  @ApiProperty({
    example: 'sipUser123',
    description: 'SIP username for authentication',
  })
  @IsString()
  sip_username: string;

  @ApiProperty({
    example: 'securePassword!',
    description: 'SIP password for authentication',
  })
  @IsString()
  sip_password: string;

  @ApiProperty({
    example: '12345',
    description: 'Technical prefix for routing',
  })
  @IsString()
  tech_prefix: string;

  @ApiProperty({
    example: 'sip.example.com',
    description: 'SIP server address',
  })
  @IsString()
  server: string;

  @ApiProperty({
    example: ['US', 'CA'],
    description: 'List of country rules associated with the trunk',
    type: [String],
  })
  @IsArray()
  @ValidateCountriesArray()
  country_rules: string[];
}

export class UpdateTrunkRequestBodyDto extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: 'New Trunk',
    description: 'The name of the trunk',
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    example: '#EEDD122213550048320',
    description: 'The uri value associated with the trunk',
    required: false,
  })
  @IsString()
  @IsOptional()
  uri: string;

  @ApiProperty({
    description:
      'The State of the trunk which can be one of the following values Primary,Backup Failover, disabled',
    required: false,
  })
  @IsEnum(TRUNK_STATE)
  @IsOptional()
  state: TRUNK_STATE;

  @ApiProperty({
    example: 'sipUser123',
    description: 'SIP username for authentication',
  })
  @IsOptional()
  @IsString()
  sip_username: string;

  @ApiProperty({
    example: 'securePassword!',
    description: 'SIP password for authentication',
  })
  @IsOptional()
  @IsString()
  sip_password: string;

  @ApiProperty({
    example: '12345',
    description: 'Technical prefix for routing',
  })
  @IsOptional()
  @IsString()
  tech_prefix: string;

  @ApiProperty({
    example: 'sip.example.com',
    description: 'SIP server address',
  })
  @IsOptional()
  @IsString()
  server: string;

  @ApiProperty({
    example: ['US', 'CA'],
    description: 'List of country rules associated with the trunk',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ValidateCountriesArray()
  country_rules: string[];
}
