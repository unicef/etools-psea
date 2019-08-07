import './etools-user';
import {EtoolsUser} from "./etools-user";

const userEl = document.createElement('etools-user') as EtoolsUser;

export const getCurrentUserData = () => {
  // TODO: find a better way of getting user data or continue with this
  userEl.getUserData(); // should req data and polpuate redux state...
};

export const updateCurrentUserData = (profile: any) => {
  return userEl.updateUserData(profile);
};

export const changeCurrentUserCountry = (countryId: number) => {
  return userEl.changeCountry(countryId);
};
