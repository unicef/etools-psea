import {LitElement, html, property, query, queryAll, customElement} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-radio-group';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import './question-attachments';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {radioButtonStyles} from '../../../../styles/radio-button-styles';
import {Answer, Question, ProofOfEvidence, Rating, AnswerEvidence} from '../../../../../types/assessment';
import {PaperRadioGroupElement} from '@polymer/paper-radio-group';
import {PaperRadioButtonElement} from '@polymer/paper-radio-button';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {GenericObject} from '../../../../../types/globals';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {QuestionAttachmentsElement} from './question-attachments';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox';
import get from 'lodash-es/get';
import {makeRequest, RequestEndpoint} from '../../../../utils/request-helper';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';

@customElement('questionnaire-answer')
export class QuestionnaireAnswerElement extends connect(store)(LitElement) {
  render() {
    return html`
      ${SharedStylesLit}${gridLayoutStylesLit}${labelAndvalueStylesLit}
      ${radioButtonStyles}
      <style>
        .padd-right {
          padding-right: 24px;
        }
        .move-left {
          margin-left: -12px;
        }
        paper-checkbox {
          padding-top: 6px;
          padding-bottom: 8px;
        }

        .invalid-color {
          color: var(--error-color);
        }
        .block {
          display: block;
        }
      </style>
      <div class="row-padding-v" ?hidden="${!this.editMode}">
        <label class="paper-label" required>Rating</label> <br/>
        <paper-radio-group id="ratingElement"
            .selected="${this.answer.rating}"
            @change="${((e: CustomEvent) => this._selectedRatingChanged(e.target as PaperRadioButtonElement))}">
          ${this._getRatingRadioButtonsTemplate(this.question)}
        </paper-radio-group>
        <span class="invalid-color block" ?hidden="${this.hideRatingRequiredMsg}">Please select Rating</span>
      </div>
      <paper-textarea id="commentsElement" label="Comments" always-float-label class="row-padding-v"
        placeholder="—"
        .value="${this.answer.comments}"
        @input="${this.changeValue}"
        ?readonly="${!this.editMode}">
      </paper-textarea>
      <div class="layout-vertical row-padding-v">
        <label class="paper-label">Proof of Evidence</label>
      </div>

      ${this._getProofOfEvidenceTemplate(this.question.evidences, this.answer)}

      <div class="row-padding-v" ?hidden="${!this.showOtherInput}">
        <paper-input id="otherEvidenceInput" label="Please specify other" always-float-label
          required
          auto-validate
          placeholder="—"
          value="${this._getOtherEvidenceInputValue(this.answer)}"
          ?readonly="${!this.editMode}"></paper-input>
      </div>

      <div class="row-padding-v">
        <question-attachments id="attachmentsElement"
          .documentTypes="${this.question.document_types}"
          .editMode="${this.editMode}"
          .attachments="${this.answer.attachments}"
          @delete-attachment="${this.deleteAnswerAttachment}">
        </question-attachments>
      </div>

    `;
  }

  @property({type: Object})
  question!: Question;

  @property({type: Object})
  answer = new Answer();

  @property({type: Boolean})
  showOtherInput: boolean = false;

  @property({type: Boolean})
  hideRatingRequiredMsg = true;

  @property({type: String})
  assessmentId!: string | number | null;

  @property({type: Boolean})
  editMode!: boolean;

  @query('#ratingElement')
  ratingElement!: PaperRadioGroupElement;

  @query('#commentsElement')
  commentsElement!: PaperTextareaElement;

  @query('#attachmentsElement')
  attachmentsElement!: QuestionAttachmentsElement;

  @query('#otherEvidenceInput')
  otherEvidenceInput!: PaperInputElement;

  @queryAll('paper-checkbox.proofOfEvidence[checked]')
  checkedEvidenceBoxes!: PaperCheckboxElement[];

  stateChanged(state: RootState) {
    if (get(state, 'app.routeDetails.params.assessmentId')) {
      let id = state.app!.routeDetails.params!.assessmentId;
      this.assessmentId = id === 'new' ? null : id;
      this.clearControls();
    }
  }
  changeValue(e: CustomEvent) {
    let target = e.target as HTMLInputElement
    let newValue = target.value;
    switch (target.id) {
      case ("commentsElement"):
        this.answer.comments = newValue;
        break;
      // other cases can be handled here, the rating is already handled
    }
    this.answer.comments = newValue;
    this.requestUpdate("answer")
  }
  clearControls() {
    if (this.answer.id === null && this.ratingElement) {
      this.ratingElement.selected = '';
      this.commentsElement.value = '';
      this.otherEvidenceInput.value = '';
      this.checkedEvidenceBoxes.forEach(el => el.checked = false);
    }
  }

  _getProofOfEvidenceTemplate(evidences: ProofOfEvidence[], answer: Answer) {
    return evidences.map((evidence: ProofOfEvidence) => {
      return html`
        <paper-checkbox class="proofOfEvidence padd-right ${this._getReadonlyStyle(this.editMode)}"
            ?checked="${this._isChecked(evidence.id, answer.evidences)}"
            evidenceid="${evidence.id}"
            ?requires-description="${evidence.requires_description}"
            @checked-changed="${(e: CustomEvent) => this._checkedEvidenceChanged(evidence, (e.target as PaperCheckboxElement).checked!, answer)}">
            ${evidence.label}
        </paper-checkbox>`;

    });
  }

  _getRatingRadioButtonsTemplate(question: Question) {
    return question.ratings.map((r: Rating, index: number) =>
      html`<paper-radio-button class="${this._getRatingRadioClass(index)}" name="${r.id}">
             ${r.label}
           </paper-radio-button>`);
  }

  _getRatingRadioClass(index: number) {
    switch (index) {
      case 0:
        return 'move-left red';
      case 1:
        return 'orange';
      case 2:
        return 'green';
      default:
        return '';
    }
  }

  _isChecked(evidenceId: string, selectedEvidences: AnswerEvidence[]) {
    if (!selectedEvidences || !selectedEvidences.length) {
      return false;
    }
    let checked = false;
    selectedEvidences.forEach(ev => {if (Number(ev.evidence) === Number(evidenceId)) {checked = true;} });
    return checked;
  }

  _selectedRatingChanged(target: PaperRadioButtonElement) {
    if (target.checked) {
      this.answer.rating = target.name!;
    }
    this.hideRatingRequiredMsg = !!target.name;
  }

  _checkedEvidenceChanged(evidence: ProofOfEvidence, checked: boolean, _answer: Answer) {
    if (evidence.requires_description) {
      this.showOtherInput = checked;
      // fix for display Other text in no-edit mode
      this.updateComplete.then(() => {this.showOtherInput = checked; this.requestUpdate();});
    }
  }

  _getOtherEvidenceInputValue(answer: Answer) {
    let otherEvidence = answer.evidences.filter((ev: AnswerEvidence) => !!ev.description)[0];
    return otherEvidence ? otherEvidence.description : '';
  }

  getAnswerForSave() {
    let answer: GenericObject = {};
    answer.assessment = this.assessmentId;
    answer.indicator = this.question.id;
    answer.rating = this.answer.rating;
    answer.comments = this.commentsElement.value;
    answer.evidences = this._getSelectedEvidences();
    answer.attachments = this.attachmentsElement.getAttachmentsForSave();
    return answer;
  }

  _getSelectedEvidences() {
    if (!this.checkedEvidenceBoxes || !this.checkedEvidenceBoxes.length) {
      return [];
    }

    let evidences: AnswerEvidence[] = [];
    this.checkedEvidenceBoxes.forEach((checkboxEl => {
      let ev: AnswerEvidence = {evidence: checkboxEl.getAttribute('evidenceid')!};
      if (checkboxEl.hasAttribute('requires-description')) {
        ev.description = this.otherEvidenceInput.value!;
      }
      evidences.push(ev);
    }));
    return evidences;
  }


  validate() {
    this.hideRatingRequiredMsg = !!this.ratingElement.selected;
    return this.hideRatingRequiredMsg;
  }

  _getReadonlyStyle(editMode: Boolean) {
    return editMode ? '' : 'readonly';
  }

  deleteAnswerAttachment(e: CustomEvent) {
    const attachmentId = e.detail.attachmentId;
    if (e.detail.isNotSavedYet) {
      this.answer = {...this.answer, attachments: this._filterOutDeletedAttachment(attachmentId)};
      return;
    }

    let url = getEndpoint(etoolsEndpoints.answerAttachment, {
      assessmentId: this.assessmentId,
      indicatorId: this.question.id
    }).url!;
    url = url + attachmentId + '/';

    return makeRequest(new RequestEndpoint(url, 'DELETE'))
      .then(() => {
        this.answer = {...this.answer, attachments: this._filterOutDeletedAttachment(attachmentId)};
      })
      .catch((err) => fireEvent(this, 'toast', formatServerErrorAsText(err)));
  }

  _filterOutDeletedAttachment(attachmentId: string) {
    return this.answer.attachments.filter(att => Number(att.id) !== Number(attachmentId));
  }



}
