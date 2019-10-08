import {UnicefUser} from '../../types/user-model';

export const isJsonStrMatch = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const cloneDeep = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

export const getFileNameFromURL = (url: string) => {
  if (!url) {
    return '';
  }
  // @ts-ignore
  return url.split('?').shift().split('/').pop();
};

export const handleAssessorsNoLongerAssignedToCurrentCountry = (assessors: UnicefUser[], assessorToCheck?: UnicefUser) => {
  if (assessorToCheck && assessorToCheck.id && assessors) {
    if (assessors.findIndex(user => user.id === assessorToCheck.id) < 0) {
      assessors.push(assessorToCheck);
      assessors.sort((a, b) => (a.name < b.name) ? -1 : 1);
    }
  }
}
