import {Action, ActionCreator} from 'redux';
import {makeRequest, RequestEndpoint} from '../../components/utils/request-helper';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';

export const UPDATE_UNICEF_USERS_DATA = 'UPDATE_UNICEF_USERS_DATA';
export const SET_PARTNERS = 'SET_PARTNERS';
export const SET_OFFICES = 'SET_OFFICES';
export const SET_SECTIONS = 'SET_SECTIONS';
export const SET_EXTERNAL_INDIVIDUALS = 'SET_EXTERNAL_INDIVIDUALS';
export const SET_ASSESSING_FIRMS = 'SET_ASSESSING_FIRMS';

export interface CommonDataActionUpdateUnicefUsersData extends Action<'UPDATE_UNICEF_USERS_DATA'> {
  unicefUsersData: object[];
}

export interface CommonDataActionSetOffices extends Action<'SET_OFFICES'> {
  offices: object[];
}

export interface CommonDataActionSetSections extends Action<'SET_SECTIONS'> {
  sections: object[];
}

export type CommonDataAction = CommonDataActionUpdateUnicefUsersData | CommonDataActionSetOffices | CommonDataActionSetSections;

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
  }
}

export const setSections = (sections: []) => {
  return {
    type: SET_SECTIONS,
    sections
  }
}

export const setExternalIndividuals = (externalIndividuals: []) => {
  return {
    type: SET_EXTERNAL_INDIVIDUALS,
    externalIndividuals
  };
};

export const loadSections = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.sections.url!))
       .then((resp: any) => dispatch(setSections(resp)))
}

export const loadOffices = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.offices.url!))
       .then((resp: any) => dispatch(setOffices(resp)))
}

export const setAssessingFirms = (assessingFirms: []) => {
  return {
    type: SET_ASSESSING_FIRMS,
    assessingFirms
  };
};

export const loadPartners = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.partners.url!))
    .then((resp: any) => dispatch(setPartners(resp)));
};

export const loadExternalIndividuals = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.externalIndividuals.url!))
    .then((resp: any) => dispatch(setExternalIndividuals(resp)));
};

export const loadAssessingFirms = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.auditorFirms.url!))
    .then((resp: any) => {
      dispatch(setAssessingFirms(resp));
    });
};
