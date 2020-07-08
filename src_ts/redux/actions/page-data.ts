import {Action, ActionCreator} from 'redux';
import {Assessment, Assessor} from '../../types/assessment';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';
import {getEndpoint} from '../../endpoints/endpoints';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

const LOGS_PREFIX = 'Redux page-data actions';

export const UPDATE_ASSESSMENT_DATA = 'UPDATE_ASSESSMENT_DATA';
export const UPDATE_ASSESSOR_DATA = 'UPDATE_ASSESSOR_DATA';
export const UPDATE_ASSESSMENT_AND_ASSESSOR = 'UPDATE_ASSESSMENT_AND_ASSESSOR';

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

export const updateAssessmentAndAssessor = (assessment: Assessment, assessor: Assessor) => {
  return {
    type: UPDATE_ASSESSMENT_AND_ASSESSOR,
    assessment,
    assessor
  };
};

const requestAssessor = (assessmentId: number) => {
  const url = getEndpoint(etoolsEndpoints.assessor, {id: assessmentId}).url!;
  return sendRequest({
    endpoint: {url: url}
  })
    .then((response: Assessor) => {
      return response;
    })
    .catch((err: any) => {
      logError('Assessor request failed', LOGS_PREFIX, err);

      return new Assessor();
    });
};

/**
 * @param assessmentId
 * @param assessorId
 * @param data
 * @param errorCallback
 */
export const saveAssessorData = (
  assessmentId: number,
  assessorId: string | number | undefined | null,
  data: any,
  errorCallback: (...args: any[]) => void
) => (dispatch: any) => {
  if (!assessmentId) {
    throw new Error(`[updateAssessorData] Invalid assessment id ${assessmentId}`);
  }
  const baseUrl = getEndpoint(etoolsEndpoints.assessor, {id: assessmentId}).url!;
  const reqOptions = {
    method: assessorId ? 'PATCH' : 'POST',
    url: assessorId ? baseUrl + assessorId + '/' : baseUrl
  };
  return sendRequest({
    endpoint: {url: reqOptions.url},
    method: reqOptions.method,
    body: data
  })
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
export const requestAssessmentAndAssessor = (assessmentId: number, errorCallback: (...args: any[]) => void) => (
  dispatch: any
) => {
  if (!assessmentId || isNaN(assessmentId)) {
    throw new Error(`[requestAssessmentData] Invalid assessment id ${assessmentId}`);
  }
  const url = `${etoolsEndpoints.assessment.url!}${assessmentId}/`;
  return sendRequest({endpoint: {url: url}})
    .then((assessment: Assessment) => {
      if (assessment.assessor) {
        // request assessor details
        requestAssessor(assessmentId).then((assessor) => {
          dispatch(updateAssessmentAndAssessor(assessment, assessor));
        });
      } else {
        // no assessor saved, init a new one
        dispatch(updateAssessmentAndAssessor(assessment, new Assessor()));
      }
    })
    .catch((err) => errorCallback(err));
};

export const requestAssessment = (assessmentId: number, errorCallback: (...args: any[]) => void) => (dispatch: any) => {
  if (!assessmentId || isNaN(assessmentId)) {
    throw new Error(`[requestAssessmentData] Invalid assessment id ${assessmentId}`);
  }
  const url = `${etoolsEndpoints.assessment.url!}${assessmentId}/`;
  return sendRequest({endpoint: {url: url}})
    .then((response: Assessment) => {
      dispatch(updateAssessmentData(response));
    })
    .catch((err) => {
      if (errorCallback) {
        errorCallback(err);
      }
    });
};
