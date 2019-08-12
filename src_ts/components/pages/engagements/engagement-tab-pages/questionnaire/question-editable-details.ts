import {LitElement, html, property} from 'lit-element';
import {GenericObject} from '../../../../../types/globals';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-radio-group';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {buttonsStylesLit} from '../../../../styles/button-styles-lit';
import './question-attachments';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {radioButtonStyles} from '../../../../styles/radio-button-styles';

class QuestionEditableDetails extends LitElement {
  render() {
    return html`
      ${SharedStylesLit}${gridLayoutStylesLit}${labelAndvalueStylesLit}${buttonsStylesLit}
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
        }
        .extra-padd {
          padding-top: 24px;
        }
      </style>
      <div class="layout-vertical row-padding-v">
        <label class="paper-label">Rating</label>
        <paper-radio-group selected="{{item.rating}}">
          <paper-radio-button class="move-left red" name="negative">Negative</paper-radio-button>
          <paper-radio-button class="orange" name="firm">Neutral</paper-radio-button>
          <paper-radio-button class="green" name="external">Positive</paper-radio-button>
        </paper-radio-group>
      </div>
      <paper-textarea label="Comments" always-float-label class="row-padding-v">
      </paper-textarea>
      <div class="layout-vertical row-padding-v">
        <label class="paper-label">Proof of Evidence</label>
        <div class="layout-horizontal row-padding-v">
          ${this._getProofOfEvidenceTemplate(this.item.proof_of_evidence)}
        </div>
      </div>

      <div class="row-padding-v extra-padd">
        <question-attachments>
        </question-attachments>
      </div>

      <div class="layout-horizontal right-align row-padding-v">
      <paper-button class="grey">
        Cancel
      </paper-button>
      <paper-button class="primary">
        Save
      </paper-button>
    </div>
    `;
  }

  @property({type: Object})
  item: GenericObject = {
    proof_of_evidence: [{name: 'Code of conduct', checked: false}, {
      name: 'Actions ',
      checked: false
    }, {name: 'Other', checked: false}]
  };

  @property({type: Boolean})
  showOtherInput: boolean = false;

  _getProofOfEvidenceTemplate(proofOfEvidence: []) {
    return proofOfEvidence.map((m: GenericObject, index) => {
      if (m.name.toLowerCase().includes('other') && index + 1 === proofOfEvidence.length) {
        return html`
          <div class="layout-vertical">
            <paper-checkbox class="padd-right" ?checked="${m.checked}" 
              @change="${event => this._showOtherInput(event.target.checked)}">
                ${m.name}
            </paper-checkbox>
            <div class="row-padding-v" ?hidden=${!this.showOtherInput}>
              <paper-input label="Please specify other" always-float-label></paper-input>
            </div>
          </div>`;
      } else {
        return html`<paper-checkbox class="padd-right" ?checked="${m.checked}">${m.name}</paper-checkbox>`;
      }
    });
  }

  _showOtherInput(checked: boolean) {
    this.showOtherInput = checked;
  }
}

window.customElements.define('question-editable-details', QuestionEditableDetails);
