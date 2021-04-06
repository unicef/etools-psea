import {Action, ActionCreator} from 'redux';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';
import {GenericObject} from '../../types/globals';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

const LOGS_PREFIX = 'Redux common-data actions';

export const SET_UNICEF_USERS_DATA = 'SET_UNICEF_USERS_DATA';
export const SET_PARTNERS = 'SET_PARTNERS';
export const SET_OFFICES = 'SET_OFFICES';
export const SET_SECTIONS = 'SET_SECTIONS';
export const SET_EXTERNAL_INDIVIDUALS = 'SET_EXTERNAL_INDIVIDUALS';
export const SET_ASSESSING_FIRMS = 'SET_ASSESSING_FIRMS';
export const SET_SEA_RISK_RATINGS = 'SET_SEA_RISK_RATINGS';

export interface CommonDataActionSetUnicefUsersData extends Action<'SET_UNICEF_USERS_DATA'> {
  unicefUsersData: object[];
}

export interface CommonDataActionSetOffices extends Action<'SET_OFFICES'> {
  offices: object[];
}

export interface CommonDataActionSetSections extends Action<'SET_SECTIONS'> {
  sections: object[];
}

export type CommonDataAction =
  | CommonDataActionSetUnicefUsersData
  | CommonDataActionSetOffices
  | CommonDataActionSetSections;

export const updateUnicefUsersData: ActionCreator<CommonDataActionSetUnicefUsersData> = (unicefUsersData: object[]) => {
  return {
    type: SET_UNICEF_USERS_DATA,
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

export const loadSections = () => (dispatch: any) => {
  sendRequest({
    endpoint: {url: etoolsEndpoints.sections.url!}
  })
    .then((resp: any) => dispatch(setSections(resp)))
    .catch((error: GenericObject) => {
      logError('loadSections req error...', LOGS_PREFIX, error);
    });
};

export const loadOffices = () => (dispatch: any) => {
  sendRequest({
    endpoint: {url: etoolsEndpoints.offices.url!}
  })
    .then((resp: any) => dispatch(setOffices(resp)))
    .catch((error: GenericObject) => {
      logError('loadOffices req error...', LOGS_PREFIX, error);
    });
};

const setSEARiskRatings = (seaRiskRatings: {label: string; value: string}[]) => {
  return {
    type: SET_SEA_RISK_RATINGS,
    seaRiskRatings
  };
};

export const loadStaticData = () => (dispatch: any) => {
  sendRequest({
    endpoint: {url: etoolsEndpoints.dropdownsStatic.url!}
  })
    .then((resp: any) => dispatch(setSEARiskRatings(resp.sea_risk_ratings)))
    .catch((error: GenericObject) => {
      logError('loadOffices req error...', LOGS_PREFIX, error);
    });
};

export const setAssessingFirms = (assessingFirms: []) => {
  return {
    type: SET_ASSESSING_FIRMS,
    assessingFirms
  };
};

export const loadPartners = () => (dispatch: any) => {
  sendRequest({
    endpoint: {url: etoolsEndpoints.partners.url!}
  })
    .then((resp: any) => dispatch(setPartners(resp)))
    .catch((error: GenericObject) => {
      logError('loadPartners req error...', LOGS_PREFIX, error);
    });
};

export const loadExternalIndividuals = (callBack?: () => void) => (dispatch: any) => {
  sendRequest({
    endpoint: {url: etoolsEndpoints.externalIndividuals.url!}
  })
    .then((resp: any) => {
      dispatch(setExternalIndividuals(resp));
    })
    .catch((error: GenericObject) => {
      logError('loadExternalIndividuals req error...', LOGS_PREFIX, error);
    })
    .then(() => {
      if (callBack && typeof callBack === 'function') {
        callBack();
      }
    });
};

export const loadAssessingFirms = () => (dispatch: any) => {
  sendRequest({
    endpoint: {url: etoolsEndpoints.auditorFirms.url!}
  })
    .then((resp: any) => {
      dispatch(setAssessingFirms(resp));
    })
    .catch((error: GenericObject) => {
      logError('loadAssessingFirms req error...', LOGS_PREFIX, error);
    });
};

export const loadUnicefUsers = () => (dispatch: any) => {
  sendRequest({
    endpoint: {url: etoolsEndpoints.unicefUsers.url!}
  })
    .then((resp: any) => {
      dispatch(updateUnicefUsersData(resp));
    })
    .catch((error: GenericObject) => {
      logError('loadUnicefUsers req error...', LOGS_PREFIX, error);
    });
};
