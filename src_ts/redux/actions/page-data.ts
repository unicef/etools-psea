import {Action, ActionCreator} from 'redux';
import {Assessment} from '../../types/assessment';
import {makeRequest} from '../../components/utils/request-helper';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';

export const UPDATE_ASSESSMENT_DATA = 'UPDATE_ASSESSMENT_DATA';

export interface AssessmentActionUpdate extends Action<'UPDATE_ASSESSMENT_DATA'> {
  currentAssessment: Assessment;
}

export type PageDataAction = AssessmentActionUpdate;

export const updateAssessmentData: ActionCreator<AssessmentActionUpdate> = (currentAssessment: Assessment) => {
  return {
    type: UPDATE_ASSESSMENT_DATA,
    currentAssessment
  };
};

/**
 * Request assessment data and update redux store
 * @param assessmentId
 * @param errorCallback
 */
export const requestAssessmentData =
  (assessmentId: number, errorCallback: (...args: any[]) => void) => (dispatch: any) => {
    if (!assessmentId || isNaN(assessmentId)) {
      throw new Error(`[requestAssessmentData] Invalid assessment id ${assessmentId}`);
    }
    const url = `${etoolsEndpoints.assessment.url!}${assessmentId}/`;
    return makeRequest({url: url})
      .then((response) => {
        dispatch(updateAssessmentData(response));
      })
      .catch(err => errorCallback(err));
  };
