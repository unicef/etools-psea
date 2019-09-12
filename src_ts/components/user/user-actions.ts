import {EtoolsUserPermissions} from '../../types/user-model';
import {GenericObject} from '../../types/globals';
import {store} from '../../redux/store';
import {makeRequest, RequestEndpoint} from '../utils/request-helper';
import {setUserData, setUserPermissions} from '../../redux/actions/user';
import {getEndpoint} from '../../endpoints/endpoints';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';


export const getCurrentUserData = () => {
  // TODO: find a better way of getting user data or continue with this
  getUserData(); // should req data and polpuate redux state...
};

export const updateCurrentUserData = (profile: any) => {
  return updateUserData(profile);
};

export const changeCurrentUserCountry = (countryId: number) => {
  return changeCountry(countryId);
  // .then(() => {
  //   // refresh user data (no other way, country change req returns 204)
  //   getCurrentUserData();
  // });
};

export function getUserData() {
  const options = new RequestEndpoint(getEndpoint(etoolsEndpoints.userProfile).url);
  return makeRequest(options).then((response: GenericObject) => {
    // console.log('response', response);
    store.dispatch(setUserData(response));
    store.dispatch(setUserPermissions(getUserPermissions(response)));
  }).catch((error: GenericObject) => {
    console.error('[EtoolsUser]: getUserData req error...', error);
    throw error;
  });
}

export function updateUserData(profile: GenericObject) {
  const options = new RequestEndpoint(getEndpoint(etoolsEndpoints.userProfile).url!, 'PATCH');
  return makeRequest(options, profile).then((response: GenericObject) => {
    store.dispatch(setUserData(response));
    store.dispatch(setUserPermissions(getUserPermissions(response)));
  }).catch((error: GenericObject) => {
    console.error('[EtoolsUser]: setUserData req error ', error);
    throw error;
  });
}

private function getUserPermissions(user: GenericObject): EtoolsUserPermissions {
  const permissions: EtoolsUserPermissions = {
    canAddAssessment: user && user.groups && Boolean(user.groups.find((group: any) => group.name === 'UNICEF User' || group.name === 'UNICEF Audit Focal Point'))
  }
  return permissions;
}

export function changeCountry(countryId: number) {
  const options = new RequestEndpoint(getEndpoint(etoolsEndpoints.changeCountry).url!, 'POST');
  return makeRequest(options, {country: countryId}).catch((error: GenericObject) => {
    console.error('[EtoolsUser]: setUserData req error ', error);
    throw error;
  });
}
