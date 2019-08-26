import {Reducer} from 'redux';
import {UPDATE_UNICEF_USERS_DATA, SET_PARTNERS} from '../actions/common-data';
import {RootAction} from '../store';
import {UnicefUser} from '../../types/globals';

export interface CommonDataState {
  unicefUsers: UnicefUser[];
  partners: [];
}

const INITIAL_COMMON_DATA: CommonDataState = {
  unicefUsers: [],
  partners: []
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
    default:
      return state;
  }
};

export default commonData;
