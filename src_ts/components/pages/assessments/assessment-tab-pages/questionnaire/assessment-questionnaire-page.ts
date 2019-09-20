import {LitElement, html, property} from 'lit-element';
import './questionnaire-item';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {makeRequest, RequestEndpoint} from '../../../../utils/request-helper';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {Question, Answer} from '../../../../../types/assessment';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {cloneDeep} from '../../../../utils/utils';
import get from 'lodash-es/get';
import {requestAssessmentData} from '../../../../../redux/actions/page-data';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import { QuestionnaireItemElement } from './questionnaire-item';

/**
 * @customElement
 */
class AssessmentQuestionnairePage extends connect(store)(LitElement) {

  render() {
    // language=HTML
    return html`
      ${gridLayoutStylesLit} ${SharedStylesLit}
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
          background-color: var(--primary-shade-of-green);
          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
        .r-align {
          text-align: right;
        }
        .l-align {
          text-align: left;
        }
      </style>

      <div class="overall layout-horizontal" ?hidden="${!this.overallRatingDisplay}">
        <div class="col-5 r-align">Overall Assessment:</div><div class="col-1"></div>
        <div class="col-6 l-align"> ${this.overallRatingDisplay}</div>
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

  stateChanged(state: RootState) {
    let newAssessmentId = get(state, 'app.routeDetails.params.assessmentId');
    if (newAssessmentId && newAssessmentId !== this.assessmentId) {
      this.assessmentId = newAssessmentId;
      this.getAnswers();
    }
    let currentAssessment = get(state, 'pageData.currentAssessment');
    if (currentAssessment) {
      this.setOverallRatingDisplay(currentAssessment.overall_rating);
      this.setAnswersEditPermision(get(currentAssessment, 'permissions.edit.answers'));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.getQuestionnaire();
  }

  setAnswersEditPermision(canEdit: boolean | undefined) {
    this.canEditAnswers = !!canEdit;
  }

  setOverallRatingDisplay(overall_rating: {rating: number, display: string}) {
    if (overall_rating && overall_rating.display !== 'Unknown') {
      this.overallRatingDisplay = overall_rating.display;
    } else {
      this.overallRatingDisplay = '';
    }
  }

  _getQuestionnaireItemsTemplate(questionnaireItems: Question[], answers: Answer[], canEditAnswers: boolean) {
    if (!questionnaireItems || !questionnaireItems.length) {
      return '';
    }

    return this.questionnaireItems.map((question: Question) => {
      let answer = this._getAnswerByQuestionId(question.id, answers);

      return html`<questionnaire-item .question="${cloneDeep(question)}"
        .answer="${answer}"
        .canEditAnswers="${this.canEditAnswers}"
        .assessmentId="${this.assessmentId}"
        @answer-saved="${this.checkOverallRating}"
        @answer-cancelled="${this.answerCancelled}">
       </questionnaire-item>`
      });
  }

  checkOverallRating(e: CustomEvent) {
    console.log("event recieved for saving")
    const updatedAnswer = e.detail;
    if (!updatedAnswer) {
      return;
    }

    let index = this.answers.findIndex(a => Number(a.id) === Number(updatedAnswer.id));
    if (index > -1) {
      this.answers.splice(index, 0, updatedAnswer);
    } else {
      this.answers.push(updatedAnswer);
    }

    if (this.answers.length === this.questionnaireItems.length) {
      store.dispatch(requestAssessmentData(Number(this.assessmentId), this._handleErrOnGetAssessment.bind(this)));
    }
  }

  answerCancelled(e: CustomEvent) {
    let questionId = e.detail.id
    let oldAnswer = this._getAnswerByQuestionId(questionId, this.answers);
    let questionItem = e.target as QuestionnaireItemElement
    questionItem.answer = oldAnswer
    questionItem.questionnaireAnswerElement.requestUpdate("answer", oldAnswer)
  }

  _handleErrOnGetAssessment(err: any) {
    fireEvent(this, 'toast', {text: formatServerErrorAsText(err)})
  }

  _getAnswerByQuestionId(questionId: string | number, answers: Answer[]) {
     if (!answers || !answers.length) {
       return new Answer();
     }
    let answer = answers.find(a => Number(a.indicator) === Number(questionId));

    return answer ? cloneDeep(answer) : new Answer();
  }

  getQuestionnaire() {
    console.log('---GET questionnaire---');
    let url = etoolsEndpoints.questionnaire.url!;
    makeRequest(new RequestEndpoint(url))
      .then((resp) => {
        this.questionnaireItems = resp;
      })
  }

  getAnswers() {
    let url = getEndpoint(etoolsEndpoints.getQuestionnaireAnswers, {assessmentId: this.assessmentId}).url!;
    makeRequest(new RequestEndpoint(url))
    .then((resp) => {
      this.answers = resp;
    })
  }

}

window.customElements.define('assessment-questionnaire-page', AssessmentQuestionnairePage);
