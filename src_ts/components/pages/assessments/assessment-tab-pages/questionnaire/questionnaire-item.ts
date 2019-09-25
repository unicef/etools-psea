import {LitElement, html, property, customElement, query} from 'lit-element';
import {styleMap} from 'lit-html/directives/style-map.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './questionnaire-answer';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {radioButtonStyles} from '../../../../styles/radio-button-styles';
import {Question, Answer, Rating} from '../../../../../types/assessment';
import {makeRequest, RequestEndpoint} from '../../../../utils/request-helper';
import {QuestionnaireAnswerElement} from './questionnaire-answer';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';
import {buttonsStyles} from '../../../../styles/button-styles';

@customElement('questionnaire-item')
export class QuestionnaireItemElement extends LitElement {
  render() {
    return html`
      ${SharedStylesLit}${gridLayoutStylesLit}${radioButtonStyles}${buttonsStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
          --ecp-header-height: auto;
          --ecp-title-white-space: normal;
        }
        .description {
          white-space: pre-line;
          margin-left: -24px;
          margin-right: -24px;
          margin-top: -8px;
          margin-bottom: 8px;
          padding: 16px 24px;
          font-size: 16px;
          background-color: var(--secondary-background-color);
          color: black;
        }
        .ratingInfoPnl{
          padding: 6px;
          margin: 10px 0px;
          width: 100%;
        }
        .ratingTooltip {
          --paper-tooltip-background: #FFFFFF;
          width: 80%;
          box-shadow: var(--paper-material-elevation-1_-_box-shadow);
        }
        .ratingTooltip span{
          font-size: 16px;
          color: var(--primary-text-color);
          line-height:20px;
        }
        #rating-icon{
          float: right;
          padding-right: 0px;
          color: var(--info-color);
        }
      </style>
      <etools-content-panel panel-title="${this.question.subject}" ?show-expand-btn=${!this.editMode} .open="${this.open}">
        <div slot="panel-btns">
          <paper-radio-button checked class="header-title-button ${this._getRadioBtnClass(this.answer)} readonly"
              ?hidden="${!this._answerIsSaved(this.answer)}">
            ${this._getSelectedRating(this.answer)}
          </paper-radio-button>
          <paper-icon-button
                icon="create"
                @tap="${this._allowEdit}"
                style=${styleMap(this.hideEditIcon(this.editMode, this.canEditAnswers) ? {visibility: 'hidden'} : {visibility: ''})}>
          </paper-icon-button>
        </div>
        <div class="description">
          ${this.question.content}
        </div>

        <div class="row-padding-v">
          <paper-icon-button id="rating-icon" icon="info" ?hidden="${this.hideAnswer(this.answer, this.canEditAnswers)}">
          </paper-icon-button>
          <paper-tooltip for="rating-icon" class="ratingTooltip" position="left">
              ${this.getRatingInfoHtml(this.question.rating_instructions)}
          </paper-tooltip>

          <questionnaire-answer id="questionnaireAnswerElement"
            ?hidden="${this.hideAnswer(this.answer, this.canEditAnswers)}"
            .question="${this.question}"
            .answer="${this.answer}"
            .editMode="${this.editMode && this.canEditAnswers}">
          </questionnaire-answer>
        </div>

        <div class="layout-horizontal right-align row-padding-v" ?hidden="${this.hideActionButtons(this.answer, this.editMode, this.canEditAnswers)}">
          <paper-button class="default" @tap="${this.cancel}">
            Cancel
          </paper-button>
          <paper-button class="primary" @tap="${this.saveAnswer}">
            Save
          </paper-button>
        </div>

      </etools-content-panel>
    `;
  }

  @property({type: Object})
  question!: Question;

  @property({type: Object})
  answer!: Answer;

  @property({type: Boolean})
  open = false;

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: String})
  assessmentId!: string;

  @property({type: Boolean})
  canEditAnswers!: boolean;

  @query('#questionnaireAnswerElement')
  questionnaireAnswerElement!: QuestionnaireAnswerElement;

  _getRadioBtnClass(answer: Answer) {
    //TODO
    switch (Number(answer.rating)) { // This is kind of hardcoded, see if this approach is reliable
      case 1:
        return 'red';
      case 2:
        return 'orange';
      case 3:
        return 'green';
      default:
        return '';
    }
  }

  _getSelectedRating(answer: Answer) {
    if (!answer || !answer.id) {
      return ''; //it should be hidden in this case
    }
    let ratingObj = this.question.ratings.find((r: Rating) => Number(r.id) === Number(this.answer.rating));
    return ratingObj ? ratingObj.label : '';
  }

  _answerIsSaved(answer: Answer) {
    if (!answer || !answer.id) {
      return false;
    }
    return !!answer.rating;
  }

  cancel() {
    fireEvent(this, 'cancel-answer', this.question.id);
    this.editMode = false;
    this.open = false;
  }

  saveAnswer() {
    if (!this.validate()) {
      return;
    }

    let endpointData = new RequestEndpoint(this._getUrl(), this._getMethod());
    let answerBody = this.questionnaireAnswerElement.getAnswerForSave();
    makeRequest(endpointData, answerBody)
      .then((resp) => {
        this.answer = resp;
        this.editMode = false;
        this.open = false;
        fireEvent(this, 'answer-saved', this.answer);
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      });
  }

  _getUrl() {
    let url = getEndpoint(etoolsEndpoints.saveQuestionnaireAnswer, {
      assessmentId: this.assessmentId,
      indicatorId: this.question.id
    }).url!;
    return url;
  }

  _getMethod() {
    return (this.answer && this.answer.id) ? 'PATCH' : 'POST';
  }

  validate() {
    return this.questionnaireAnswerElement.validate();
  }

  hideActionButtons(answer: Answer, editMode: boolean, canEditAnswers: boolean) {
    if (!canEditAnswers) {
      return true;
    }
    if (!answer || !answer.id) {
      return false;
    }
    return !editMode;
  }

  hideEditIcon(editMode: boolean, canEditAnswers: boolean) {
    if (!canEditAnswers) {
      return true;
    }
    if (editMode) {
      return true;
    }
    return false;
  }

  _allowEdit() {
    this.editMode = true;
    this.open = true;
  }

  hideAnswer(answer: Answer, canEditAnswers: boolean) {
    if (canEditAnswers) {
      return false;
    } else {
      return (!answer || !answer.id);
    }
  }

  getRatingInfoHtml(instructions?: string) {
    if (instructions) {
      const dataToDisplay = JSON.parse(instructions);
      // TO BE DONE
    }
    return html`
      <div class='row-padding'>
        <div class="layout-vertical col-12 ratingInfoPnl red-border">
            <span class="paper-label font-bold">1- Absent: The organization is not working towards this standard</span>
            <span class="paper-label">Give this score if the organization meets one of the criteria</span>
        </div>
        <div class="layout-vertical col-12 ratingInfoPnl orange-border">
          <span class="paper-label font-bold">2-Progressing: The organization has made some progress towards applying this standard, but certain
          aspecs need to be improved</span>
            <span class="paper-label">Give this score if the organization meets one or two of the three criteria</span>
        </div>
        <div class="layout-vertical col-12 ratingInfoPnl green-border">
          <span class="paper-label font-bold">3- Adequate: The organization fully meets this standard</span>
          <span class="paper-label">Give this score if the organization meets all of the three criteria</span>
        </div>
      </div>
    `;
  }

}
