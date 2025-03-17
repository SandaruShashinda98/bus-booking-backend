import { ILead } from '@interface/leads/leads';
import { findCountryDetails } from './country.helper';

export function leadDetailsMap(details: ILead) {
  // Find and map the country information
  details.country = findCountryDetails(details.country);
}
