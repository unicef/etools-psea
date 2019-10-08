import {UnicefUser} from '../../types/user-model';

export const handleAssessorsNoLongerAssignedToCurrentCountry = (assessors: UnicefUser[], assessorToCheck?: UnicefUser) => {
  if (assessorToCheck && assessorToCheck.id && assessors) {
    if (assessors.findIndex(user => user.id === assessorToCheck.id) < 0) {
      assessors.push(assessorToCheck);
      assessors.sort((a, b) => (a.name < b.name) ? -1 : 1);
    }
  }
}
