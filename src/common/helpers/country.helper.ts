import { IUpload } from '@interface/upload/upload';
import { countries } from '@meta-data/countries';
import { ICountry } from '@interface/settings/object-list';

export function isValidCountry(v: any): v is ICountry {
  return (
    typeof v.name === 'string' &&
    typeof v.code === 'string' &&
    typeof v.image === 'string' &&
    typeof v.checked === 'boolean' &&
    Array.isArray(v.dial_codes) &&
    v.dial_codes.every((code: any) => typeof code === 'string')
  );
}

//The following function takes a country name and return the available data associated with the country name
export function findCountryDetails(countryName: string) {
  return countries.find(
    (country) =>
      country.name.toLowerCase() === countryName?.trim().toLowerCase(),
  );
}

//The following function Adds the available country data to a set of data
export function addCountryData(uploadData: IUpload) {
  const countries = uploadData.country_data;

  const countriesWithImages = countries
    ?.map((country) => ({
      ...findCountryDetails(country.name),
      value: country.value,
    }))
    .filter(Boolean);

  return { ...uploadData, country_data: countriesWithImages };
}
