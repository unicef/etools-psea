import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './questionnaire-answer';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {radioButtonStyles} from '../../../../styles/radio-button-styles';
import {Question, Answer} from '../../../../../types/engagement';

@customElement('questionnaire-item')
export class QuestionnaireItemElement extends LitElement {
  render() {
    return html`
      ${SharedStylesLit}${gridLayoutStylesLit}${radioButtonStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        .description {
          margin-left: -24px;
          margin-right: -24px;
          margin-top: -8px;
          margin-bottom: 8px;
          padding: 16px 24px;
          font-size: 16px;
          background-color: var(--secondary-background-color);
        }
      </style>
      <etools-content-panel panel-title="${this.question.subject}" show-expand-btn .open="${this.open}">
        <div slot="panel-btns">
          <paper-radio-button checked class="${this._getRadioBtnClass()}">
            Positive
          </paper-radio-button>
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>
        <div class="description">
          ${this.question.content}
        </div>
        <div class="row-padding-v">
          <questionnaire-answer .question="${this.question}">
          </questionnaire-answer>
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

  _getRadioBtnClass() {
    //TODO
    return 'green';
  }
}
