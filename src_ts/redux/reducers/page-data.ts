import {Reducer} from 'redux';
import {UPDATE_ASSESSMENT_DATA} from '../actions/page-data';
import {RootAction} from '../store';
import {GenericObject} from '../../types/globals';

export interface PageDataState {
  currentAssessment: GenericObject;
}

const INITIAL_PAGE_DATA: PageDataState = {
  currentAssessment: {}
};

const pageData: Reducer<PageDataState, RootAction> = (state = INITIAL_PAGE_DATA, action) => {
  switch (action.type) {
    case UPDATE_ASSESSMENT_DATA:
      return {
        ...state,
        currentAssessment: action.currentAssessment
      };
    default:
      return state;
  }
};

export default pageData;
