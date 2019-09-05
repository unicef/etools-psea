import {Reducer} from 'redux';
import {UPDATE_ASSESSMENT_DATA} from '../actions/page-data';
import {RootAction} from '../store';
import {Assessment} from '../../types/assessment';

export interface PageDataState {
  currentAssessment: Assessment;
}

const INITIAL_PAGE_DATA: PageDataState = {
  currentAssessment: new Assessment()
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
