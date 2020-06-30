import {LitElement, html, property, customElement} from 'lit-element';
import {repeat} from 'lit-html/directives/repeat';
import './questionnaire-item';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {Question, Answer} from '../../../../../types/assessment';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {cloneDeep} from '../../../../utils/utils';
import get from 'lodash-es/get';
import {requestAssessmentAndAssessor} from '../../../../../redux/actions/page-data';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import '../../../../common/layout/etools-error-warn-box';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

export enum EtoolsPseaOverallRating {
  Low = 'Low',
  Moderate = 'Moderate',
  High = 'High'
}

/**
 * @customElement
 * @LitElement
 */
@customElement('assessment-questionnaire-page')
export class AssessmentQuestionnairePage extends connect(store)(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    // language=HTML
    return html`
      ${SharedStylesLit}
      <style>
        :host {
          display: block;
          background-color: var(--secondary-background-color);
        }
        .overall {
          padding: 16px 0;
          margin-bottom: 32px;
          font-size: 24px;
          color: white;
          background-color: var(--primary-color); /* fallback color */
          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
            0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
        .red {
          background-color: var(--primary-shade-of-red);
        }
        .orange {
          background-color: var(--primary-shade-of-orange);
        }
        .green {
          background-color: var(--primary-shade-of-green);
        }
        .r-align {
          text-align: right;
        }
        .l-align {
          text-align: left;
        }
      </style>
      <etools-loading loading-text="Loading..." .active="${this.loadingQuestions || this.loadingAnswers}">
      </etools-loading>
      <div
        class="overall layout-horizontal ${this._getColorClass(this.overallRatingDisplay)}"
        ?hidden="${!this.overallRatingDisplay}"
      >
        <div class="col-5 r-align">SEA Risk Rating:</div>
        <div class="col-1"></div>
        <div class="col-6 l-align">${this.overallRatingDisplay}</div>
      </div>
      ${this._getQuestionnaireItemsTemplate(this.questionnaireItems, this.answers, this.canEditAnswers)}
    `;
  }

  @property({type: Array})
  questionnaireItems!: Question[];

  @property({type: Array})
  answers!: Answer[];

  @property({type: String})
  assessmentId!: string | number;

  @property({type: String})
  overallRatingDisplay!: string;

  @property({type: Boolean})
  canEditAnswers!: boolean;

  @property({type: Boolean})
  loadingQuestions!: boolean;

  @property({type: Boolean})
  loadingAnswers!: boolean;

  @property({type: Boolean})
  isUnicefUser = false;

  stateChanged(state: RootState) {
    const newAssessmentId = get(state, 'app.routeDetails.params.assessmentId');
    if (newAssessmentId === 'new' || this.notOnQuestionnairePage(get(state, 'app.routeDetails'))) {
      return;
    }

    if (newAssessmentId && newAssessmentId !== this.assessmentId) {
      this.assessmentId = newAssessmentId;
      this.getAnswers();
    }
    const currentAssessment = get(state, 'pageData.currentAssessment');
    if (currentAssessment) {
      this.setOverallRatingDisplay(currentAssessment.overall_rating);
      this.setAnswersEditPermision(get(currentAssessment, 'permissions.edit.answers'));
    }
    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.getQuestionnaire();
  }

  notOnQuestionnairePage(routeDetails: any) {
    return !(routeDetails.routeName === 'assessments' && routeDetails.subRouteName === 'questionnaire');
  }

  setAnswersEditPermision(canEdit: boolean | undefined) {
    this.canEditAnswers = !!canEdit;
  }

  setOverallRatingDisplay(overall_rating: {rating: number; display: string}) {
    if (overall_rating && overall_rating.display !== '-') {
      this.overallRatingDisplay = overall_rating.display;
    } else {
      this.overallRatingDisplay = '';
    }
  }

  _getQuestionnaireItemsTemplate(questionnaireItems: Question[], answers: Answer[], canEditAnswers: boolean) {
    if (!questionnaireItems) {
      return;
    }

    return repeat(
      questionnaireItems,
      (question) => question.stamp,
      (question: Question) => {
        const answer = this._getAnswerByQuestionId(question.id, answers);

        return html`<questionnaire-item
          .question="${cloneDeep(question)}"
          .answer="${cloneDeep(answer)}"
          .canEditAnswers="${canEditAnswers}"
          .assessmentId="${this.assessmentId}"
          .isUnicefUser="${this.isUnicefUser}"
          @answer-saved="${this.checkOverallRating}"
          @cancel-answer="${this.cancelUnsavedChanges}"
        >
        </questionnaire-item>`;
      }
    );
  }

  _getColorClass(overallRatingDisplay: string) {
    switch (overallRatingDisplay) {
      case EtoolsPseaOverallRating.High:
        return 'red';
      case EtoolsPseaOverallRating.Moderate:
        return 'orange';
      case EtoolsPseaOverallRating.Low:
        return 'green';
      default:
        return '';
    }
  }

  cancelUnsavedChanges(e: CustomEvent) {
    const q = this.questionnaireItems.find((q) => q.id == e.detail)!;
    q.stamp = Date.now();
    this.requestUpdate();
  }

  checkOverallRating(e: CustomEvent) {
    const updatedAnswer = e.detail;
    if (!updatedAnswer) {
      return;
    }

    const index = this.answers.findIndex((a) => Number(a.id) === Number(updatedAnswer.id));
    if (index > -1) {
      this.answers.splice(index, 1, updatedAnswer);
    } else {
      this.answers.push(updatedAnswer);
    }

    if (this.answers.length === this.questionnaireItems.length) {
      store.dispatch(
        requestAssessmentAndAssessor(Number(this.assessmentId), this._handleErrOnGetAssessment.bind(this))
      );
    }
  }

  _handleErrOnGetAssessment(err: any) {
    fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
  }

  _getAnswerByQuestionId(questionId: string | number, answers: Answer[]) {
    if (!answers || !answers.length) {
      return new Answer();
    }
    const answer = answers.find((a) => Number(a.indicator) === Number(questionId));

    return answer ? cloneDeep(answer) : new Answer();
  }

  getQuestionnaire() {
    this.loadingQuestions = true;
    const url = etoolsEndpoints.questionnaire.url!;
    sendRequest({
      endpoint: {url: url}
    })
      .then((resp) => {
        resp.map((r: any) => (r.stamp = Date.now()));
        this.questionnaireItems = resp;
      })
      .catch((err: any) => logError('Questions req failed', 'AssessmentQuestionnairePage', err))
      .then(() => (this.loadingQuestions = false));
  }

  getAnswers() {
    this.loadingAnswers = true;
    const url = getEndpoint(etoolsEndpoints.getQuestionnaireAnswers, {assessmentId: this.assessmentId}).url!;
    sendRequest({
      endpoint: {url: url}
    })
      .then((resp) => {
        this.answers = resp;
      })
      .catch((err: any) => logError('Get answers req failed', 'AssessmentQuestionnairePage', err))
      .then(() => (this.loadingAnswers = false));
  }
}
