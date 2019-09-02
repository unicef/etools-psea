import {Action, ActionCreator} from 'redux';
import {makeRequest, RequestEndpoint} from '../../components/utils/request-helper';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';

export const UPDATE_UNICEF_USERS_DATA = 'UPDATE_UNICEF_USERS_DATA';
export const SET_PARTNERS = 'SET_PARTNERS';
export const SET_EXTERNAL_INDIVIDUALS = 'SET_EXTERNAL_INDIVIDUALS';


export interface CommonDataActionUpdateUnicefUsersData extends Action<'UPDATE_UNICEF_USERS_DATA'> {
  unicefUsersData: object[];
}

export type CommonDataAction = CommonDataActionUpdateUnicefUsersData;

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
  }
}

export const setExternalIndividuals = (externalIndividuals: []) => {
  return {
    type: SET_EXTERNAL_INDIVIDUALS,
    externalIndividuals
  }
}

export const loadPartners = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.partners.url!))
       .then((resp:any) => dispatch(setPartners(resp)));
}

export const loadExternalIndividuals = () => (dispatch: any) => {
  makeRequest(new RequestEndpoint(etoolsEndpoints.externalIndividuals.url!))
       .then((resp:any) => dispatch(setExternalIndividuals(resp)));
}
