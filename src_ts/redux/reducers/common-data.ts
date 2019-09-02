import {Reducer} from 'redux';
import {UPDATE_UNICEF_USERS_DATA, SET_PARTNERS, SET_EXTERNAL_INDIVIDUALS} from '../actions/common-data';
import {RootAction} from '../store';
import {UnicefUser} from '../../types/globals';

export interface CommonDataState {
  unicefUsers: UnicefUser[];
  partners: [];
  externalIndividuals: [];
}

const INITIAL_COMMON_DATA: CommonDataState = {
  unicefUsers: [],
  partners: [],
  externalIndividuals: []
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
    default:
      return state;
  }
};

export default commonData;
