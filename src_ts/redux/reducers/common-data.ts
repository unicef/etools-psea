import {Reducer} from 'redux';
import {
  SET_UNICEF_USERS_DATA,
  SET_PARTNERS,
  SET_EXTERNAL_INDIVIDUALS,
  SET_OFFICES,
  SET_SECTIONS,
  SET_RATINGS,
  SET_ASSESSMENT_TYPES,
  SET_INGO_REASONS,
  SET_ASSESSING_FIRMS
} from '../actions/common-data';
import {RootAction} from '../store';
import {UnicefUser} from '../../types/user-model';

export interface CommonDataState {
  unicefUsers: UnicefUser[];
  partners: [];
  offices: [];
  sections: [];
  ratings: [];
  assessment_types: [];
  ingo_reasons: [];
  externalIndividuals: [];
  assessingFirms: [];
}

const INITIAL_COMMON_DATA: CommonDataState = {
  unicefUsers: [],
  partners: [],
  offices: [],
  sections: [],
  ratings: [],
  assessment_types: [],
  ingo_reasons: [],
  externalIndividuals: [],
  assessingFirms: []
};

const commonData: Reducer<CommonDataState, RootAction> = (state = INITIAL_COMMON_DATA, action) => {
  switch (action.type) {
    case SET_UNICEF_USERS_DATA:
      return {
        ...state,
        unicefUsers: action.unicefUsersData
      };
    case SET_PARTNERS:
      return {
        ...state,
        partners: action.partners
      };
    case SET_OFFICES:
      return {
        ...state,
        offices: action.offices
      };
    case SET_SECTIONS:
      return {
        ...state,
        sections: action.sections
      };
    case SET_RATINGS:
      return {
        ...state,
        ratings: action.ratings
      };
    case SET_ASSESSMENT_TYPES:
      return {
        ...state,
        assessment_types: action.assessment_types
      };
    case SET_INGO_REASONS:
      return {
        ...state,
        ingo_reasons: action.ingo_reasons
      };
    case SET_EXTERNAL_INDIVIDUALS:
      return {
        ...state,
        externalIndividuals: action.externalIndividuals
      };
    case SET_ASSESSING_FIRMS:
      return {
        ...state,
        assessingFirms: action.assessingFirms
      };
    default:
      return state;
  }
};

export default commonData;
