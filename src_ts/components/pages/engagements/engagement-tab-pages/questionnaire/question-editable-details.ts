import {LitElement, html, property} from 'lit-element';
import {GenericObject} from '../../../../../types/globals';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-radio-group';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {buttonsStylesLit} from '../../../../styles/button-styles-lit';

class QuestionEditableDetails extends LitElement {
  render() {
    return html`
      ${gridLayoutStylesLit}${labelAndvalueStylesLit}${buttonsStylesLit}
      <style>
        .padd-right {
          padding-right: 16px;
        }
        .move-left {
          margin-left: -12px;
        }
        paper-checkbox {
          padding-top: 6px;
        }
      </style>
      <div class="layout-vertical row-padding-v">
        <label class="paper-label">Rating</label>
        <paper-radio-group selected="{{item.rating}}">
          <paper-radio-button class="move-left" name="negative">Negative</paper-radio-button>
          <paper-radio-button name="firm">Neutral</paper-radio-button>
          <paper-radio-button name="external">Positive</paper-radio-button>
        </paper-radio-group>
      </div>
      <paper-textarea label="Comments" always-float-label class="row-padding-v">
      </paper-textarea>
      <div class="layout-vertical row-padding-v">
        <label class="paper-label">Proof of Evidence</label>
        <div class="layout-horizontal row-padding-v">
          ${this.item.proof_of_evidence.map(m => html`
            <paper-checkbox class="padd-right" ?checked="${m.checked}">${m.name}</paper-checkbox>
            ${m.name.includes('Other') ? html`<paper-input label="Please specify other" always-float-label></paper-input>`:''}
          `)}
        </div>
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
  item: GenericObject ={proof_of_evidence:[{name: 'Code of conduct', checked: false}, {name:'Other', checked: false}]};
}
window.customElements.define('question-editable-details', QuestionEditableDetails);
