import {LitElement, html, property, query, queryAll} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-radio-group';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {buttonsStyles} from '../../../../styles/button-styles';
import './question-attachments';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {radioButtonStyles} from '../../../../styles/radio-button-styles';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox';
import {Answer, Question, ProofOfEvidence, Rating} from '../../../../../types/assessment';
import {PaperRadioGroupElement} from '@polymer/paper-radio-group';
import {PaperRadioButtonElement} from '@polymer/paper-radio-button';
import {cloneDeep} from 'lodash-es';
import {RequestEndpoint, makeRequest} from '../../../../utils/request-helper';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {GenericObject} from '../../../../../types/globals';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {QuestionAttachmentsElement} from './question-attachments';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';

class QuestionnaireAnswer extends connect(store)(LitElement) {
  render() {
    return html`
      ${SharedStylesLit}${gridLayoutStylesLit}${labelAndvalueStylesLit}${buttonsStyles}
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
      <div class="row-padding-v">
        <label class="paper-label" required>Rating</label> <br/>
        <paper-radio-group id="ratingElement" .selected="${this.answer.rating}" @change="${(e => this._selectedRatingChanged(e.target))}">
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
        <paper-input label="Please specify other" always-float-label></paper-input>
      </div>

      <div class="row-padding-v extra-padd">
        <question-attachments id="attachmentsElement">
        </question-attachments>
      </div>

      <div class="layout-horizontal right-align row-padding-v">
      <paper-button class="default" @tap="${this.cancel}">
        Cancel
      </paper-button>
      <paper-button class="primary" @tap="${this.saveAnswer}">
        Save
      </paper-button>
    </div>
    `;
  }

  @property({type: Object})
  question!: Question;

  @property({type: Object})
  answer = new Answer();

  @property({type: Object})
  originalAnswer!: Answer;

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

  @queryAll('paper-checkbox.proofOfEvidence[checked]')
  checkedEvidenceBoxes!: NodeList;

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
            @change="${(e: CustomEvent) => this._checkedEvidenceChanged(evidence, (e.target as PaperCheckboxElement).checked!)}">
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

  _isChecked(evidenceId: string, selectedEvidenceIds: string[]) {
    if (!selectedEvidenceIds || !selectedEvidenceIds.length) {
      return false;
    }
    return selectedEvidenceIds.includes(evidenceId);
  }

  _selectedRatingChanged(target: PaperRadioButtonElement) {
    if (target.checked) {
      this.answer.rating = target.name!;
    }
    this.hideRatingRequired = !!target.name;
  }

  _checkedEvidenceChanged(evidence: ProofOfEvidence, checked: boolean) {
    if (evidence.requires_description) {
      this.showOtherInput = checked;
    }

    //this._computeSelectedEvidencesIds(evidence, checked);

  }

  // _computeSelectedEvidencesIds(evidence: ProofOfEvidence, checked: boolean) {
  //   if (!this.answer.evidences.length) {
  //     this.answer.evidences = [];
  //   }
  //   if (checked) {
  //     this.answer.evidences.push(evidence.id);
  //   } else {
  //     this.answer.evidences =  this.answer.evidences.filter(id => Number(id) !== Number(evidence.id));
  //   }
  // }

  cancel() {
    if (this.answer && this.answer.id) {
      this.answer = cloneDeep(this.originalAnswer)
    } else {
      this.answer = new Answer();
    }
  }

  saveAnswer() {
    if (!this.validate()) {
      return;
    }

    let endpointData = new RequestEndpoint(this._getUrl(), this._getMethod());
    let answerBody = this.getAnswerForSave();
    makeRequest(endpointData, answerBody)
      .then((resp) => {
        this.answer = resp;
        this.editMode = false;
      })
      .catch((err:any) => fireEvent(this, 'toast', {text: formatServerErrorAsText(err)}));
  }

  getAnswerForSave() {
    let answer: GenericObject = {};
    answer.assessment = this.assessmentId;
    answer.indicator = this.question.id;
    answer.rating = this.answer.rating;
    answer.comments = this.commentsElement.value;
    answer.evidences = this._getSelectedEvidenceIds();
    answer.attachments = this.attachmentsElement.getAttachmentsForSave();
    return answer;
  }

  _getSelectedEvidenceIds() {
    if (!this.checkedEvidenceBoxes || !this.checkedEvidenceBoxes.length) {
      return [];
    }

    let ids: string[] = [];
    this.checkedEvidenceBoxes.forEach((checkboxEl =>
      ids.push(checkboxEl.getAttribute('evidenceid'))));
    return ids;
  }


  _getUrl() {
    let url = getEndpoint(etoolsEndpoints.questionnaireItemAnswer, {assessmentId: this.assessmentId}).url!;
    if (this.answer && this.answer.id) {
      url = url + this.answer.id + '/';
    }

    return url;
  }

  _getMethod() {
    return (this.answer && this.answer.id) ? 'PATCH' : 'POST';
  }

  validate() {
    this.hideRatingRequired = !!this.ratingElement.selected;
    return this.hideRatingRequired;
  }
}

window.customElements.define('questionnaire-answer', QuestionnaireAnswer);
