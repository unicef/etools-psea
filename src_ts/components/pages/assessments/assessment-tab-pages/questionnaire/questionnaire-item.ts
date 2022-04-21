import {LitElement, html, property, customElement, query, css} from 'lit-element';
import {styleMap} from 'lit-html/directives/style-map.js';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@material/mwc-radio';
import '@material/mwc-formfield';
import './questionnaire-answer';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {radioButtonStyles} from '../../../../styles/radio-button-styles';
import {Question, Answer, Rating, AnswerAttachment} from '../../../../../types/assessment';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {QuestionnaireAnswerElement} from './questionnaire-answer';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {buttonsStyles} from '../../../../styles/button-styles';
import {cloneDeep, isJsonStrMatch} from '../../../../utils/utils';

@customElement('questionnaire-item')
export class QuestionnaireItemElement extends LitElement {
  static get styles() {
    return [
      buttonsStyles,
      radioButtonStyles,
      gridLayoutStylesLit,
      css`
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
        mwc-formfield {
          min-width: 140px;
        }
      `
    ];
  }
  render() {
    return html`
      ${SharedStylesLit}
      <etools-content-panel
        panel-title="${this.question.subject}"
        ?show-expand-btn=${!this.editMode}
        .open="${this.open}"
        @open-changed="${(ev: CustomEvent) => this.openChanged(ev)}"
      >
        <etools-loading loading-text="Saving..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns" class="layout-horizontal align-items-center">
          <mwc-formfield label="${this._getSelectedRating(this.answer)}" ?hidden="${!this._answerIsSaved(this.answer)}">
            <mwc-radio class="${this._getRadioBtnClass(this.answer)}" disabled checked></mwc-radio>
          </mwc-formfield>
          <paper-icon-button
            icon="create"
            @tap="${this._allowEdit}"
            style=${styleMap(
              this.hideEditIcon(this.editMode, this.canEditAnswers) ? {visibility: 'hidden'} : {visibility: ''}
            )}
          >
          </paper-icon-button>
        </div>
        <div class="description">${unsafeHTML(this.question.content)}</div>

        <div class="row-padding-v">
          <questionnaire-answer
            id="questionnaireAnswerElement"
            ?hidden="${this.hideAnswer(this.answer, this.canEditAnswers)}"
            .question="${cloneDeep(this.question)}"
            .answer="${cloneDeep(this.answer)}"
            .editMode="${this.editMode && this.canEditAnswers}"
            @delete-attachment="${this.deleteAnswerAttachment}"
            @attachments-uploaded="${this.attachmentsUploaded}"
            @file-type-changed="${this.fileTypeChanged}"
          >
          </questionnaire-answer>
        </div>

        <div class="layout-horizontal right-align row-padding-v" ?hidden="${!this.editMode || !this.canEditAnswers}">
          <paper-button class="default" @tap="${this.cancel}"> Cancel </paper-button>
          <paper-button class="primary" @tap="${this.saveAnswer}"> Save </paper-button>
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

  private _canEditAnswers!: boolean;
  @property({type: Boolean})
  get canEditAnswers() {
    return this._canEditAnswers;
  }
  set canEditAnswers(can: boolean) {
    this._canEditAnswers = can;
    if (!this.canEditAnswers) {
      this.editMode = false;
      this.open = false;
    }
  }

  @property({type: Boolean})
  isUnicefUser!: boolean;

  @property({type: Boolean})
  showLoading = false;

  @query('#questionnaireAnswerElement')
  questionnaireAnswerElement!: QuestionnaireAnswerElement;

  _getRadioBtnClass(answer: Answer) {
    // TODO
    switch (
      Number(answer.rating) // This is kind of hardcoded, see if this approach is reliable
    ) {
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
      return ''; // it should be hidden in this case
    }
    const ratingObj = this.question.ratings.find((r: Rating) => Number(r.id) === Number(this.answer.rating));
    return ratingObj ? ratingObj.label : '';
  }

  _answerIsSaved(answer: Answer) {
    if (!answer || !answer.id) {
      return false;
    }
    return !!answer.rating;
  }

  cancel() {
    fireEvent(this, 'cancel-answer', {questionId: this.question.id, attachments: this.answer.attachments});
    this.editMode = false;
    this.open = false;
  }

  saveAnswer() {
    if (!this.validate()) {
      return;
    }

    const answerBody = this.questionnaireAnswerElement.getAnswerForSave();
    if (!this.secondRoundOfValidations(answerBody)) {
      return;
    }
    this.showLoading = true;

    sendRequest({
      endpoint: {url: this._getUrl()},
      method: this._getMethod(),
      body: answerBody
    })
      .then((resp) => {
        this.answer = resp;
        this.editMode = false;
        this.open = false;
        fireEvent(this, 'answer-saved', this.answer);
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      })
      .then(() => (this.showLoading = false));
  }

  /**
   * This validation needs the result of questionnaireAnswerElement.getAnswerForSave(),
   * and in order to avoid duplicating operations of getting answer values, it's done as a second round
   */
  secondRoundOfValidations(answer: Answer) {
    const valid1 = this.questionnaireAnswerElement.validateOtherProofOfEvidence(answer.evidences);
    const valid2 = this.questionnaireAnswerElement.validateAttachments(answer.attachments);

    return valid1 && valid2;
  }

  _getUrl() {
    const url = getEndpoint(etoolsEndpoints.saveQuestionnaireAnswer, {
      assessmentId: this.assessmentId,
      indicatorId: this.question.id
    }).url!;
    return url;
  }

  _getMethod() {
    return this.answer && this.answer.id ? 'PATCH' : 'POST';
  }

  validate() {
    return this.questionnaireAnswerElement.validateRating();
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
      return !answer || !answer.id;
    }
  }

  deleteAnswerAttachment(e: CustomEvent) {
    const attachmentId = e.detail.attachmentId;
    if (e.detail.isNotSavedYet) {
      this.answer = {...this.questionnaireAnswerElement.getEditedAnswer(), attachments: e.detail.attachments};
      return;
    }

    let url = getEndpoint(etoolsEndpoints.answerAttachment, {
      assessmentId: this.assessmentId,
      indicatorId: this.question.id
    }).url!;
    url = url + attachmentId + '/';

    return sendRequest({
      endpoint: {url: url},
      method: 'DELETE'
    })
      .then(() => {
        this.answer = {
          ...this.questionnaireAnswerElement.getEditedAnswer(),
          attachments: this._filterOutDeletedAttachment(attachmentId)
        };
      })
      .catch((err: any) => fireEvent(this, 'toast', formatServerErrorAsText(err)));
  }

  _filterOutDeletedAttachment(attachmentId: string) {
    return this.answer.attachments.filter((att) => Number(att.id) !== Number(attachmentId));
  }

  attachmentsUploaded(e: CustomEvent) {
    this._attachmentsChanged(e.detail.attachments);
  }
  fileTypeChanged(e: CustomEvent) {
    this._attachmentsChanged(e.detail.attachments);
  }

  _attachmentsChanged(editedAttachments: AnswerAttachment[]) {
    if (isJsonStrMatch(editedAttachments, this.answer.attachments)) {
      return;
    }
    this.answer = {...this.questionnaireAnswerElement.getEditedAnswer(), attachments: editedAttachments};
  }
  openChanged(ev: CustomEvent<any>) {
    this.open = ev.detail.value;
  }
}
