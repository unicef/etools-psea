// TODO: improve this user model
export interface EtoolsUserModel {
  countries_available: object[];
  groups: object[];
  country: object;
  country_override: number;
  email: string;
  first_name: string;
  guid: string;
  is_active: string;
  is_staff: string;
  is_superuser: string;
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
  [key: string]: any;
}
export interface EtoolsUserPermissions{
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
