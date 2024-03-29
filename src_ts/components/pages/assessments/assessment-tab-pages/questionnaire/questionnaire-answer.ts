import {LitElement, html, property, query, queryAll, customElement, css} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-radio-group';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import './question-attachments';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {radioButtonStyles} from '../../../../styles/radio-button-styles';
import {
  Answer,
  Question,
  ProofOfEvidence,
  Rating,
  AnswerEvidence,
  AnswerAttachment
} from '../../../../../types/assessment';
import {PaperRadioGroupElement} from '@polymer/paper-radio-group';
import {PaperRadioButtonElement} from '@polymer/paper-radio-button';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {QuestionAttachmentsElement} from './question-attachments';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox';
import get from 'lodash-es/get';
import './answer-instructions';
import {cloneDeep} from '../../../../utils/utils';

@customElement('questionnaire-answer')
export class QuestionnaireAnswerElement extends connect(store)(LitElement) {
  static get styles() {
    return [
      radioButtonStyles,
      labelAndvalueStylesLit,
      gridLayoutStylesLit,
      css`
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
          font-size: 12px;
          color: var(--error-color);
          display: block;
        }
        .rating-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .rating-container .paper-label {
          padding-top: 0;
          background: url('./images/required.svg') no-repeat 87% 13%/6px;
        }
      `
    ];
  }
  render() {
    return html`
      ${SharedStylesLit}
      <div class="row-padding-v" ?hidden="${!this.editMode}">
        <div class="rating-container">
          <label class="paper-label" required>Rating</label>
          <answer-instructions></answer-instructions>
        </div>
        <div>
          <paper-radio-group
            id="ratingElement"
            .selected="${this.answer.rating}"
            @change="${(e: CustomEvent) => this._selectedRatingChanged(e.target as PaperRadioButtonElement)}"
          >
            ${this._getRatingRadioButtonsTemplate(this.question)}
          </paper-radio-group>
          <span class="invalid-color" ?hidden="${this.hideRatingRequiredMsg}">Please select Rating</span>
        </div>
      </div>
      <paper-textarea
        id="commentsElement"
        label="Comments"
        always-float-label
        class="row-padding-v"
        placeholder="—"
        .value="${this.answer.comments}"
        ?readonly="${!this.editMode}"
      >
      </paper-textarea>
      <div class="layout-vertical row-padding-v">
        <label class="paper-label">Proof of Evidence</label>
      </div>

      ${this._getProofOfEvidenceTemplate(this.question.evidences, this.answer)}

      <div class="row-padding-v" ?hidden="${!this.showOtherInput}">
        <paper-textarea
          id="otherEvidenceInput"
          label="Please specify other"
          always-float-label
          required
          .autoValidate="${this.autoValidate}"
          placeholder="—"
          .value="${this._getOtherEvidenceInputValue(this.answer)}"
          ?readonly="${!this.editMode}"
        >
        </paper-textarea>
      </div>

      <div class="row-padding-v">
        <question-attachments
          id="attachmentsElement"
          .documentTypes="${this.question.document_types}"
          .editMode="${this.editMode}"
          .attachments="${cloneDeep(this.answer.attachments)}"
        >
        </question-attachments>
      </div>
    `;
  }

  @property({type: Object})
  question!: Question;

  @property({type: Object})
  answer = new Answer();

  @property({type: Boolean})
  showOtherInput = false;

  @property({type: Boolean})
  hideRatingRequiredMsg = true;

  @property({type: String})
  assessmentId!: string | number | null;

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: Boolean})
  autoValidate = false;

  @query('#ratingElement')
  ratingElement!: PaperRadioGroupElement;

  @query('#commentsElement')
  commentsElement!: PaperTextareaElement;

  @query('#attachmentsElement')
  attachmentsElement!: QuestionAttachmentsElement;

  @query('#otherEvidenceInput')
  otherEvidenceInput!: PaperTextareaElement;

  @queryAll('paper-checkbox.proofOfEvidence[checked]')
  checkedEvidenceBoxes!: PaperCheckboxElement[];

  firstUpdated() {
    this._handlePaperTextareaAutovalidateError();
  }

  stateChanged(state: RootState) {
    if (get(state, 'app.routeDetails.params.assessmentId')) {
      const id = state.app!.routeDetails.params!.assessmentId;
      this.assessmentId = id === 'new' ? null : id;
      this.clearControls();
    }
  }

  clearControls() {
    if (this.answer.id === null && this.ratingElement) {
      this.ratingElement.selected = '';
      this.commentsElement.value = '';
      this.otherEvidenceInput.value = '';
      this.checkedEvidenceBoxes.forEach((el) => (el.checked = false));
    }
  }

  /**
   * This will prevent a console error "Uncaught TypeError: Cannot read property 'textarea' of undefined"
   * The error occurs only on first load/ hard refresh and on paper-textareas that have auto-validate
   */
  _handlePaperTextareaAutovalidateError() {
    this.autoValidate = true;
  }

  _getProofOfEvidenceTemplate(evidences: ProofOfEvidence[], answer: Answer) {
    return evidences.map((evidence: ProofOfEvidence) => {
      return html` <paper-checkbox
        class="proofOfEvidence padd-right ${this._getReadonlyStyle(this.editMode)}"
        ?checked="${this._isChecked(evidence.id, answer.evidences)}"
        evidenceid="${evidence.id}"
        ?requires-description="${evidence.requires_description}"
        @checked-changed="${(e: CustomEvent) =>
          this._checkedEvidenceChanged(evidence, (e.target as PaperCheckboxElement).checked!, answer)}"
      >
        ${evidence.label}
      </paper-checkbox>`;
    });
  }

  _getRatingRadioButtonsTemplate(question: Question) {
    return question.ratings.map(
      (r: Rating, index: number) =>
        html`<paper-radio-button class="${this._getRatingRadioClass(index)}" name="${r.id}">
          ${r.label}
        </paper-radio-button>`
    );
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
    selectedEvidences.forEach((ev: any) => {
      if (Number(ev.evidence) === Number(evidenceId)) {
        checked = true;
      }
    });
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
      this.updateComplete.then(() => {
        this.showOtherInput = checked;
        this.requestUpdate();
      });
    }
  }

  _getOtherEvidenceInputValue(answer: Answer) {
    if (!answer) {
      return '';
    }
    const otherEvidence = answer.evidences.filter((ev: AnswerEvidence) => !!ev.description)[0];
    return otherEvidence ? otherEvidence.description : '';
  }

  getAnswerForSave() {
    const answer = this.getEditedAnswer();
    delete answer.id;
    return answer;
  }

  getEditedAnswer() {
    const answer: Answer = new Answer();
    answer.id = this.answer.id;
    answer.assessment = this.assessmentId;
    answer.indicator = this.question.id;
    answer.rating = this.answer.rating;
    answer.comments = this.commentsElement.value || '';
    answer.evidences = this._getSelectedEvidences();
    answer.attachments = this.attachmentsElement.getAttachmentsForSave();
    return answer;
  }

  _getSelectedEvidences() {
    if (!this.checkedEvidenceBoxes || !this.checkedEvidenceBoxes.length) {
      return [];
    }

    const evidences: AnswerEvidence[] = [];
    this.checkedEvidenceBoxes.forEach((checkboxEl: HTMLElement) => {
      const ev: AnswerEvidence = {evidence: checkboxEl.getAttribute('evidenceid')!};
      if (checkboxEl.hasAttribute('requires-description')) {
        ev.description = this.otherEvidenceInput.value || '';
      }
      evidences.push(ev);
    });
    return evidences;
  }

  validateRating() {
    this.hideRatingRequiredMsg = !!this.ratingElement.selected;
    return this.hideRatingRequiredMsg;
  }

  validateOtherProofOfEvidence(selectedEvidences: AnswerEvidence[]) {
    const valid = selectedEvidences.filter((e: AnswerEvidence) => e.description === '').length === 0;
    if (!valid) {
      this.otherEvidenceInput.invalid = true;
    }

    return valid;
  }

  validateAttachments(uploadedAttachments: AnswerAttachment[]) {
    return this.attachmentsElement.validate(uploadedAttachments);
  }

  _getReadonlyStyle(editMode: boolean) {
    return editMode ? '' : 'readonly';
  }
}
