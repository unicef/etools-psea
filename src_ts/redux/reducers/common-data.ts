import {Reducer} from 'redux';
import {UPDATE_UNICEF_USERS_DATA, SET_PARTNERS, SET_EXTERNAL_INDIVIDUALS, SET_ASSESSING_FIRMS} from '../actions/common-data';
import {RootAction} from '../store';
import {UnicefUser} from '../../types/user-model';

export interface CommonDataState {
  unicefUsers: UnicefUser[];
  partners: [];
  externalIndividuals: [];
  assessingFirms: [];
}

const INITIAL_COMMON_DATA: CommonDataState = {
  unicefUsers: [],
  partners: [],
  externalIndividuals: [],
  assessingFirms: []
};

const commonData: Reducer<CommonDataState, RootAction> = (state = INITIAL_COMMON_DATA, action) => {
  switch (action.type) {
    case UPDATE_UNICEF_USERS_DATA:
      return {
        ...state,
        unicefUsers: action.unicefUsersData
      };
    case SET_PARTNERS:
      return {
        ...state,
        partners: action.partners
      }
    case SET_EXTERNAL_INDIVIDUALS:
      return {
        ...state,
        externalIndividuals: action.externalIndividuals
      }
      case SET_ASSESSING_FIRMS:
        return {
          ...state,
          assessingFirms: action.assessingFirms
        }
    default:
      return state;
  }
};

export default commonData;
