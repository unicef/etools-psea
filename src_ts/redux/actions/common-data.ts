import {Action, ActionCreator} from 'redux';
import {makeRequest, RequestEndpoint} from '../../components/utils/request-helper';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';
import {GenericObject} from '../../types/globals';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

export const UPDATE_UNICEF_USERS_DATA = 'UPDATE_UNICEF_USERS_DATA';
export const SET_PARTNERS = 'SET_PARTNERS';
export const SET_OFFICES = 'SET_OFFICES';
export const SET_SECTIONS = 'SET_SECTIONS';
export const SET_EXTERNAL_INDIVIDUALS = 'SET_EXTERNAL_INDIVIDUALS';
export const SET_ASSESSING_FIRMS = 'SET_ASSESSING_FIRMS';
export const SET_USERS = 'SET_USERS';

export interface CommonDataActionUpdateUnicefUsersData extends Action<'UPDATE_UNICEF_USERS_DATA'> {
  unicefUsersData: object[];
}

export interface CommonDataActionSetOffices extends Action<'SET_OFFICES'> {
  offices: object[];
}

export interface CommonDataActionSetSections extends Action<'SET_SECTIONS'> {
  sections: object[];
}

export type CommonDataAction =
  CommonDataActionUpdateUnicefUsersData
  | CommonDataActionSetOffices
  | CommonDataActionSetSections;

export const updateUnicefUsersData: ActionCreator<CommonDataActionUpdateUnicefUsersData> =
  (unicefUsersData: object[]) => {
    return {
      type: UPDATE_UNICEF_USERS_DATA,
      unicefUsersData
    };
  };

export const setPartners = (partners: []) => {
  return {
    type: SET_PARTNERS,
    partners
  };
};

export const setOffices = (offices: []) => {
  return {
    type: SET_OFFICES,
    offices
  };
};

export const setSections = (sections: []) => {
  return {
    type: SET_SECTIONS,
    sections
  };
};

export const setExternalIndividuals = (externalIndividuals: []) => {
  return {
    type: SET_EXTERNAL_INDIVIDUALS,
    externalIndividuals
  };
};

export const setUsers = (users: []) => {
  return {
    type: SET_USERS,
    users
  };
};

export const loadSections = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.sections.url!))
    .then((resp: any) => dispatch(setSections(resp)))
    .catch((error: GenericObject) => {
      logError('[EtoolsUnicefUser]: loadSections req error...', error);
      throw error;
    });
};

export const loadOffices = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.offices.url!))
    .then((resp: any) => dispatch(setOffices(resp)))
    .catch((error: GenericObject) => {
      logError('[EtoolsUnicefUser]: loadOffices req error...', error);
      throw error;
    });
};

export const setAssessingFirms = (assessingFirms: []) => {
  return {
    type: SET_ASSESSING_FIRMS,
    assessingFirms
  };
};

export const loadPartners = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.partners.url!))
    .then((resp: any) => dispatch(setPartners(resp)))
    .catch((error: GenericObject) => {
      logError('[EtoolsUnicefUser]: loadPartners req error...', error);
      throw error;
    });
};

export const loadExternalIndividuals = (callBack?: () => void) => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.externalIndividuals.url!))
    .then((resp: any) => {
      dispatch(setExternalIndividuals(resp));
    })
    .catch((error: GenericObject) => {
      logError('[EtoolsUnicefUser]: loadExternalIndividuals req error...', error);
      throw error;
    })
    .then(() => {
      if (callBack && typeof (callBack) === 'function') {
        callBack();
      }
    });
};

export const loadAssessingFirms = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.auditorFirms.url!))
    .then((resp: any) => {
      dispatch(setAssessingFirms(resp));
    })
    .catch((error: GenericObject) => {
      logError('[EtoolsUnicefUser]: loadAssessingFirms req error...', error);
      throw error;
    });
};

export const loadUnicefUsersData = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.unicefUsers.url!))
      .then((resp: any) => dispatch(setUsers(resp)))
      .catch((error: GenericObject) => {
        logError('[EtoolsUnicefUser]: loadUnicefUsersData req error...', error);
        throw  error;
      });
};
