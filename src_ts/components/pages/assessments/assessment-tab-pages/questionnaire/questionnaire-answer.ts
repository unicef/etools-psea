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
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox';
import {Answer, Question, ProofOfEvidence, Rating, AnswerEvidence} from '../../../../../types/assessment';
import {PaperRadioGroupElement} from '@polymer/paper-radio-group';
import {PaperRadioButtonElement} from '@polymer/paper-radio-button';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {GenericObject} from '../../../../../types/globals';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {QuestionAttachmentsElement} from './question-attachments';
import {PaperInputElement} from '@polymer/paper-input/paper-input';

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
        .extra-padd {
          padding-top: 32px;
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
        <paper-radio-group id="ratingElement" .selected="${this.answer.rating}" @change="${((e: CustomEvent) => this._selectedRatingChanged(e.target as PaperRadioButtonElement))}">
          ${this._getRatingRadioButtonsTemplate(this.question)}
        </paper-radio-group>
        <span class="invalid-color block" ?hidden="${this.hideRatingRequired}">Please select Rating</span>
      </div>
      <paper-textarea id="commentsElement" label="Comments" always-float-label class="row-padding-v" .value="${this.answer.comments}">
      </paper-textarea>
      <div class="layout-vertical row-padding-v">
        <label class="paper-label">Proof of Evidence</label>
      </div>

      ${this._getProofOfEvidenceTemplate(this.question.evidences, this.answer)}

      <div class="row-padding-v" ?hidden=${!this.showOtherInput}>
        <paper-input id="otherEvidenceInput" label="Please specify other" always-float-label></paper-input>
      </div>

      <div class="row-padding-v extra-padd">
        <question-attachments id="attachmentsElement">
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
  hideRatingRequired = true;

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

  // @queryAll('paper-checkbox.proofOfEvidence[checked]')
  // checkedEvidenceBoxes!: NodeList;

  stateChanged(state: RootState) {
    if (state.app!.routeDetails.params && state.app!.routeDetails.params!.assessmentId) {
      let id = state.app!.routeDetails.params!.assessmentId;
      this.assessmentId = id === 'new' ? null : id;
    }
  }

  _getProofOfEvidenceTemplate(evidences: ProofOfEvidence[], answer: Answer) {
    return evidences.map((evidence: ProofOfEvidence) => {
      return html`
        <paper-checkbox class="proofOfEvidence padd-right" ?checked="${this._isChecked(evidence.id, answer.evidences)}"
            evidenceid="${evidence.id}"
            @change="${(e: CustomEvent) => this._checkedEvidenceChanged(evidence, answer.evidences, (e.target as PaperCheckboxElement).checked!)}">
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

  _getRatingRadioClass(index: number)  {
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

  _isChecked(evidenceId: string, selectedEvidences: {evidence:string, other: string}[]) {
    if (!selectedEvidences || !selectedEvidences.length) {
      return false;
    }
    let checked = false;
    selectedEvidences.forEach(ev => { if (Number(ev.evidence) === Number(evidenceId)) {checked = true;} });
    return checked;
  }

  _selectedRatingChanged(target: PaperRadioButtonElement) {
    if (target.checked) {
      this.answer.rating = target.name!;
    }
    this.hideRatingRequired = !!target.name;
  }

  _checkedEvidenceChanged(evidence: ProofOfEvidence, answerEvidences: any, checked: boolean) {
    if (evidence.requires_description) {
      this.showOtherInput = checked;
    }

    this._computeSelectedEvidencesIds(evidence, answerEvidences, checked);

  }

  _computeSelectedEvidencesIds(evidence: ProofOfEvidence, answerEvidences: AnswerEvidence[], checked: boolean) {
    if (!answerEvidences.length) {
      this.answer.evidences = [];
    }

    if (checked) {
      let ev: AnswerEvidence = {evidence: evidence.id};
      if (evidence.requires_description) {
        ev.description = this.otherEvidenceInput.value!;
      }
      answerEvidences.push(ev);
    } else {
      answerEvidences =  this.answer.evidences.filter(ev => Number(ev.evidence) !== Number(evidence.id));
    }

    this.answer.evidences = answerEvidences;
  }

  getAnswerForSave() {
    let answer: GenericObject = {};
    answer.assessment = this.assessmentId;
    answer.indicator = this.question.id;
    answer.rating = this.answer.rating;
    answer.comments = this.commentsElement.value;
    answer.evidences = this.answer.evidences;
    answer.attachments = this.attachmentsElement.getAttachmentsForSave();
    return answer;
  }

  // _getSelectedEvidenceIds() {
  //   if (!this.checkedEvidenceBoxes || !this.checkedEvidenceBoxes.length) {
  //     return [];
  //   }

  //   let ids: string[] = [];
  //   this.checkedEvidenceBoxes.forEach((checkboxEl =>
  //     ids.push(checkboxEl.getAttribute('evidenceid'))));
  //   return ids;
  // }


  validate() {
    this.hideRatingRequired = !!this.ratingElement.selected;
    return this.hideRatingRequired;
  }


}


