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

/**
 * @customElement
 */
class AssessmentQuestionnairePage extends connect(store)(LitElement) {

  render() {
    // language=HTML
    return html`
      ${gridLayoutStylesLit}
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

      <div class="overall layout-horizontal">
        <div class="col-5 r-align">Overall Assessment:</div><div class="col-1"></div>
        <div class="col-6 l-align"> Positive</div>
      </div>
      ${this._getQuestionnaireItemsTemplate(this.questionnaireItems, this.answers)}
    `;
  }

  @property({type: Array})
  questionnaireItems!: Question[];

  @property({type: Array})
  answers!: Answer[];

  @property({type: String})
  assessmentId!: string | number;

  stateChanged(state: RootState) {
    let newAssessmentId = get(state, 'app.routeDetails.params.assessmentId');
    if (newAssessmentId && newAssessmentId !== this.assessmentId) {
      this.assessmentId = newAssessmentId;
      this.getAnswers();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.getQuestionnaire();
  }


  _getQuestionnaireItemsTemplate(questionnaireItems: Question[], answers: Answer[]) {
    if (!questionnaireItems || !questionnaireItems.length) {
      return '';
    }

    return this.questionnaireItems.map((question: Question) => {
      let answer = this._getAnswerByQuestionId(question.id, answers);
      return html`<questionnaire-item .question="${cloneDeep(question)}"
       .answer="${answer}"
       .editMode="${(!answer || !answer.id)}"
       .assessmentId="${this.assessmentId}"></questionnaire-item>`
      });
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
