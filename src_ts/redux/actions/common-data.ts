import {Action, ActionCreator} from 'redux';
import {makeRequest} from '../../components/utils/request-helper';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';

export const UPDATE_UNICEF_USERS_DATA = 'UPDATE_UNICEF_USERS_DATA';
export const SET_PARTNERS = 'SET_PARTNERS';


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

export const loadPartners = () => (dispatch) => {
  makeRequest(etoolsEndpoints.partners)
       .then((resp:any) => dispatch(setPartners(resp)));
}
