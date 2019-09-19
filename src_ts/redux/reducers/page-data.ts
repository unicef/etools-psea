import {Reducer} from 'redux';
import {UPDATE_ASSESSMENT_DATA, UPDATE_ASSESSOR_DATA} from '../actions/page-data';
import {RootAction} from '../store';
import {Assessment, Assessor} from '../../types/assessment';

export interface PageDataState {
  currentAssessment: Assessment | null;
  assessor: Assessor | null;
}

const INITIAL_PAGE_DATA: PageDataState = {
  currentAssessment: null,
  assessor: null
};

const pageData: Reducer<PageDataState, RootAction> = (state = INITIAL_PAGE_DATA, action) => {
  switch (action.type) {
    case UPDATE_ASSESSMENT_DATA:
      return {
        ...state,
        currentAssessment: action.currentAssessment
      };
    case UPDATE_ASSESSOR_DATA:
      return {
        ...state,
        assessor: action.assessor
      };
    default:
      return state;
  }
};

export default pageData;
