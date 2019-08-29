import {Reducer} from 'redux';
import {UPDATE_UNICEF_USERS_DATA, SET_PARTNERS, SET_OFFICES, SET_SECTIONS} from '../actions/common-data';
import {RootAction} from '../store';
import {UnicefUser} from '../../types/globals';

export interface CommonDataState {
  unicefUsers: UnicefUser[];
  partners: [];
  offices: [];
  sections: [];
}

const INITIAL_COMMON_DATA: CommonDataState = {
  unicefUsers: [],
  partners: [],
  offices: [],
  sections: []
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
    case SET_OFFICES:
      return {
        ...state,
        offices: action.offices
      }
    case SET_SECTIONS:
        return {
          ...state,
          sections: action.sections
        }
    default:
      return state;
  }
};

export default commonData;
