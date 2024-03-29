import {GenericObject} from './globals';

// TODO: improve this user model
export interface EtoolsUserModel {
  countries_available: GenericObject[];
  groups: GenericObject[];
  country: GenericObject;
  country_override: number;
  email: string;
  first_name: string;
  guid: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  job_title: string;
  last_login: string;
  last_name: string;
  middle_name: string;
  name: string;
  office: string | null;
  oic: any;
  user: number;
  username: string;
  vendor_number: string | null;
  is_unicef_user: boolean;
}
export interface EtoolsUserPermissions {
  canAddAssessment: boolean;
  canExportAssessment: boolean;
}
export interface EtoolsStaffMemberModel {
  id: string;
  hasAccess: boolean;
  user: EtoolsStaffUserModel;
}
export interface EtoolsStaffUserModel {
  email: string;
  first_name: string;
  last_name: string;
  profile: EtoolsStaffMemberProfileModel;
}
export interface EtoolsStaffMemberProfileModel {
  job_title: string;
  phone_number: string;
}

export interface UnicefUser {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  name: string;
  email: string;
}
