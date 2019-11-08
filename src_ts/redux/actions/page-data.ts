import {Action, ActionCreator} from 'redux';
import {Assessment, Assessor} from '../../types/assessment';
import {makeRequest, RequestEndpoint} from '../../components/utils/request-helper';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';
import {getEndpoint} from '../../endpoints/endpoints';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

const LOGS_PREFIX = 'Redux page-data actions';

export const UPDATE_ASSESSMENT_DATA = 'UPDATE_ASSESSMENT_DATA';
export const UPDATE_ASSESSOR_DATA = 'UPDATE_ASSESSOR_DATA';

export interface AssessmentActionUpdate extends Action<'UPDATE_ASSESSMENT_DATA'> {
  currentAssessment: Assessment;
}

export interface AssessorActionUpdate extends Action<'UPDATE_ASSESSOR_DATA'> {
  assessor: Assessor;
}

export type PageDataAction = AssessmentActionUpdate;

export const updateAssessmentData: ActionCreator<AssessmentActionUpdate> = (currentAssessment: Assessment) => {
  return {
    type: UPDATE_ASSESSMENT_DATA,
    currentAssessment
  };
};

export const updateAssessorData: ActionCreator<AssessorActionUpdate> = (assessor: Assessor) => {
  return {
    type: UPDATE_ASSESSOR_DATA,
    assessor
  };
};

/**
 * @param assessmentId
 */
export const requestAssessorData = (assessmentId: number) => (dispatch: any) => {
  const url = getEndpoint(etoolsEndpoints.assessor, {id: assessmentId}).url!;
  makeRequest({url: url})
    .then((response: Assessor) => {
      dispatch(updateAssessorData(response));
    })
    .catch((err: any) => {
      logError('Assessor request failed', LOGS_PREFIX, err);
      if (err.status === 404) {
        // in case assessor is not found, init as new assessor
        dispatch(updateAssessorData(new Assessor()));
      }
    });
};

/**
 * @param assessmentId
 * @param assessorId
 * @param data
 * @param errorCallback
 */
export const saveAssessorData = (assessmentId: number,
  assessorId: string | number | undefined | null,
  data: any,
  errorCallback: (...args: any[]) => void) =>
  (dispatch: any) => {
    if (!assessmentId) {
      throw new Error(`[updateAssessorData] Invalid assessment id ${assessmentId}`);
    }
    const baseUrl = getEndpoint(etoolsEndpoints.assessor, {id: assessmentId}).url!;
    const reqOptions: RequestEndpoint = {
      method: assessorId ? 'PATCH' : 'POST',
      url: assessorId ? (baseUrl + assessorId + '/') : baseUrl
    };
    return makeRequest(reqOptions, data)
      .then((response) => {
        dispatch(updateAssessorData(response));
      })
      .catch((err: any) => errorCallback(err));

  };

/**
 * Request assessment and assessor and update redux store
 * @param assessmentId
 * @param errorCallback
 */
export const requestAssessmentAndAssessor =
  (assessmentId: number, errorCallback: (...args: any[]) => void) => (dispatch: any) => {
    if (!assessmentId || isNaN(assessmentId)) {
      throw new Error(`[requestAssessmentData] Invalid assessment id ${assessmentId}`);
    }
    const url = `${etoolsEndpoints.assessment.url!}${assessmentId}/`;
    return makeRequest({url: url})
      .then((response: Assessment) => {
        dispatch(updateAssessmentData(response));
        if (response.assessor) {
          // request assessor details
          dispatch(requestAssessorData(assessmentId));
        } else {
          // no assessor saved, init a new one
          dispatch(updateAssessorData(new Assessor()));
        }
      })
      .catch(err => errorCallback(err));
  };

export const requestAssessment = (assessmentId: number, errorCallback: (...args: any[]) => void) => (dispatch: any) => {
  if (!assessmentId || isNaN(assessmentId)) {
    throw new Error(`[requestAssessmentData] Invalid assessment id ${assessmentId}`);
  }
  const url = `${etoolsEndpoints.assessment.url!}${assessmentId}/`;
  return makeRequest({url: url})
    .then((response: Assessment) => {
      dispatch(updateAssessmentData(response));
    })
    .catch((err) => {
      if (errorCallback) {
        errorCallback(err);
      }
    });
};
