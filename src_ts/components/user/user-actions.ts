import {EtoolsUserPermissions} from '../../types/user-model';
import {GenericObject} from '../../types/globals';
import {store} from '../../redux/store';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {setUserData, setUserPermissions} from '../../redux/actions/user';
import {getEndpoint} from '../../endpoints/endpoints';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

const LOGS_PREFIX = 'user-actions';

export const getCurrentUserData = () => {
  // TODO: find a better way of getting user data or continue with this
  return getUserData(); // should req data and polpuate redux state...
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
  return sendRequest({
    endpoint: {url: getEndpoint(etoolsEndpoints.userProfile).url}
  })
    .then((response: GenericObject) => {
      // console.log('response', response);
      store.dispatch(setUserData(response));
      store.dispatch(setUserPermissions(getUserPermissions(response)));
      return response;
    })
    .catch((error: GenericObject) => {
      logError('getUserData req error...', LOGS_PREFIX, error);
      if (error.status === 403) {
        window.location.href = window.location.origin + '/login';
      }
      throw error;
    });
}

export function updateUserData(profile: GenericObject) {
  // const options = new RequestEndpoint(getEndpoint(etoolsEndpoints.userProfile).url!, 'PATCH');
  return sendRequest({
    endpoint: {url: getEndpoint(etoolsEndpoints.userProfile).url},
    method: 'PATCH',
    body: profile
  })
    .then((response: GenericObject) => {
      store.dispatch(setUserData(response));
      store.dispatch(setUserPermissions(getUserPermissions(response)));
    })
    .catch((error: GenericObject) => {
      logError('setUserData req error ', LOGS_PREFIX, error);
      throw error;
    });
}

function getUserPermissions(user: GenericObject): EtoolsUserPermissions {
  const permissions: EtoolsUserPermissions = {
    canAddAssessment:
      user &&
      user.groups &&
      Boolean(
        user.groups.find((group: any) => group.name === 'UNICEF User' || group.name === 'UNICEF Audit Focal Point')
      ),
    canExportAssessment: user && user.groups
  };
  return permissions;
}

export function changeCountry(countryId: number) {
  return sendRequest({
    endpoint: {url: getEndpoint(etoolsEndpoints.changeCountry).url},
    method: 'POST',
    body: {country: countryId}
  }).catch((error: GenericObject) => {
    logError('setUserData req error ', LOGS_PREFIX, error);
    throw error;
  });
}
