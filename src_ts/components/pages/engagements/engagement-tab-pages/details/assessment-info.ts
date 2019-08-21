import {LitElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../styles/button-styles';
import {GenericObject} from '../../../../../types/globals';
import './partner-details';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';

/**
 * @customElement
 * @LitElement
 */
class AssessmentInfo extends LitElement {

  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
      </style>
      ${SharedStylesLit}${gridLayoutStylesLit} ${buttonsStyles}
      <etools-content-panel panel-title="Assessment Information">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        <etools-dropdown label="Partner Organization to Assess"
          class="row-padding-v col-6 w100"
          ?readonly="${this.readonly}"
          .options="${this.partners}"
          .optionValue="${'id'}"
          .optionLabel="${'name'}"
          trigger-value-change-event
          readonly
          @etools-selected-item-changed="${this._setSelectedPartner}">
        </etools-dropdown>

        ${this._showPartnerDetails(this.selectedPartner)}

        <etools-dropdown label="UNICEF Focal Point"
          class="row-padding-v">
        </etools-dropdown>

        <datepicker-lite label="Assessment Date"
          class="row-padding-v"
          selected-date-display-format="D MMM YYYY">
        </datepicker-lite>

        <div class="layout-horizontal right-align row-padding-v">
          <paper-button class="default">
            Cancel
          </paper-button>
          <paper-button class="primary">
            Save
          </paper-button>
        </div>

      </etools-content-panel>
    `;
  }

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Object})
  partners: GenericObject = [{id: 1, name: 'Zamboni',
    authorized_officers: ['Ala Bala', 'Poto Cala'],
    adress: 'Strulibili 23', phone: 12345678, email: 'email@email.com'}];

  @property({type: Object})
  selectedPartner!: GenericObject;

  @property({type: Boolean})
  readonly: boolean = false;


  connectedCallback() {
    super.connectedCallback();
    this._getPartnerOrganizations();
  }

  _getPartnerOrganizations() {
    // this.sendRequest({endpoint: etoolsEndpoints.partners})
    //   .then((resp) => this.partners = resp)
    //   .catch((err) => console.log(err));
  }

  _allowEdit() {

  }

  _showPartnerDetails(selectedPartner: GenericObject) {
    return selectedPartner?
      html`<partner-details .partner="${this.selectedPartner}">
      </partner-details>`: '';
  }

  _setSelectedPartner(event: CustomEvent) {
    this.selectedPartner = event.detail.selectedItem;
  }

}

window.customElements.define('assessment-info', AssessmentInfo);
