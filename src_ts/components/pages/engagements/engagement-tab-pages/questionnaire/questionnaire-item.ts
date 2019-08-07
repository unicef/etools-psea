import {LitElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import {GenericObject} from '../../../../../types/globals';
import './question-editable-details';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';

class QuestionnaireItem extends LitElement {
  render() {
    return html`
      ${gridLayoutStylesLit}
      <style>
        .description {
          margin-left: -24px;
          margin-right: -24px;
          margin-top: -8px;
          margin-bottom: 8px;
          padding: 16px 24px;
          background-color: var(--secondary-background-color);
        }
      </style>
      <etools-content-panel panel-title="${this.item.title}" show-expand-btn>
        <div slot="panel-btns">
          <paper-radio-button>
            Positive
          </paper-radio-button>
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>
        <div class="description">
          ${this.item.description}
        </div>
        <div class="row-padding-v">
          <question-editable-details>
          </question-editable-details>
        </div>

      </etools-content-panel>
    `;
  }

  @property({type: Object})
  item: GenericObject = {title:'An organizational policy exists (as part of code of conduct'+
    'and/or a comprehensive SEA policy) and is signed by all'+
    'personnel.', description:'Do organizational policies include: A) a clear'+
    'definition of SEA; B) a clear description of behaviour'+
    'expected of personnel (incorporating the IASC’s Six'+
    'Core Principles Relating to SEA) and; C) an explicit'+
    'statement of zero tolerance for SEA?'+
     'Are all personnel required to receive and sign'+
    'organizational policies related to PSEA (e.g. code of'+
    'conduct)?'};
}
window.customElements.define('questionnaire-item', QuestionnaireItem);
