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
export const SET_RATINGS = 'SET_RATINGS';
export const SET_ASSESSMENT_TYPES = 'SET_ASSESSMENT_TYPES';
export const SET_INGO_REASONS = 'SET_INGO_REASONS';

export interface CommonDataActionSetUnicefUsersData extends Action<'SET_UNICEF_USERS_DATA'> {
  unicefUsersData: object[];
}

export interface CommonDataActionSetOffices extends Action<'SET_OFFICES'> {
  offices: object[];
}

export interface CommonDataActionSetSections extends Action<'SET_SECTIONS'> {
  sections: object[];
}

export interface CommonDataActionSetRatings extends Action<'SET_RATINGS'> {
  ratings: object[];
}

export interface CommonDataActionSetAssessmentTypes extends Action<'SET_ASSESSMENT_TYPES'> {
  assessment_types: object[];
}

export interface CommonDataActionSetReasons extends Action<'SET_INGO_REASONS'> {
  ingo_reasons: object[];
}

export type CommonDataAction =
  | CommonDataActionSetUnicefUsersData
  | CommonDataActionSetOffices
  | CommonDataActionSetSections
  | CommonDataActionSetRatings
  | CommonDataActionSetAssessmentTypes
  | CommonDataActionSetReasons;

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

export const setRatings = (ratings: []) => {
  return {
    type: SET_RATINGS,
    ratings
  };
};

export const setAssessmentTypes = (assessment_types: []) => {
  return {
    type: SET_ASSESSMENT_TYPES,
    assessment_types
  };
};

export const setIngoReasons = (ingo_reasons: []) => {
  return {
    type: SET_INGO_REASONS,
    ingo_reasons
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

export const loadStaticData = () => (dispatch: any) => {
  sendRequest({
    endpoint: {url: etoolsEndpoints.staticData.url!}
  })
    .then((resp: any) => {
      dispatch(setRatings(resp.ratings || []));
      dispatch(setAssessmentTypes(resp.types || []));
      dispatch(setIngoReasons(resp.ingo_reasons || []));
    })
    .catch((error: GenericObject) => {
      logError('loadStaticData req error...', LOGS_PREFIX, error);
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
