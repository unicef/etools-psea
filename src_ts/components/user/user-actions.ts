import {store} from '../../store';
import './etools-user';
import {EtoolsUser} from "./etools-user";
import {EtoolsUserModel} from "./user-model";


const userEl = document.createElement('etools-user') as EtoolsUser;

export const getCurrentUserData = () => {
  // TODO: find a better way of getting user data or continue with this

  userEl.getUserData(); // should req data and polupate redux state...

};

export const updateCurrentUserData = (profile: any) => {
  console.log("user-actions");
  userEl.updateUserData(profile);
};
