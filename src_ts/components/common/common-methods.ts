import {UnicefUser} from '../../types/user-model';

export const handleUsersNoLongerAssignedToCurrentCountry = (users: UnicefUser[], usersToCheck?: UnicefUser[]) => {
  if (usersToCheck && usersToCheck.length > 0 && users && users.length > 0) {
    let changed = false;
    usersToCheck.forEach((usr) => {
      if (users.findIndex(x => x.id === usr.id) < 0) {
        users.push(usr);
        changed = true;
      }
    });
    if (changed) {
      users.sort((a, b) => (a.name < b.name) ? -1 : 1);
    }
  }
}
