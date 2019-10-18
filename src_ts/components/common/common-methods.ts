import {UnicefUser} from '../../types/user-model';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {fireEvent} from '../utils/fire-custom-event';
import {formatServerErrorAsText} from '../utils/ajax-error-parser';

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
};

export function genericErrorHandling(error: any) {
  logError(error);
  // @ts-ignore *The method will be used with bind(this)
  fireEvent(this, 'toast', {text: formatServerErrorAsText(error), showCloseBtn: true});

}
