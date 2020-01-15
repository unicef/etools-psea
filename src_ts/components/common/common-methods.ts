import {UnicefUser} from '../../types/user-model';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {fireEvent} from '../utils/fire-custom-event';
import {formatServerErrorAsText} from '../utils/ajax-error-parser';

export const handleUsersNoLongerAssignedToCurrentCountry = (availableUsers: UnicefUser[], savedUsers?: UnicefUser[]) => {
  if (savedUsers && savedUsers.length > 0 && availableUsers && availableUsers.length > 0) {
    let changed = false;
    savedUsers.forEach((savedUsr) => {
      if (availableUsers.findIndex(x => x.id === savedUsr.id) < 0) {
        availableUsers.push(savedUsr);
        changed = true;
      }
    });
    if (changed) {
      availableUsers.sort((a, b) => (a.name < b.name) ? -1 : 1);
    }
  }
};

//!!! The method will be used with bind(this)
export function genericErrorHandling(error: any) {
  logError('genericErrorHandling', 'common-methods', error);
  //@ts-ignore
  fireEvent(this, 'toast', {text: formatServerErrorAsText(error), showCloseBtn: true});

}
