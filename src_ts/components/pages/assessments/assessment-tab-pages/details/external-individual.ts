import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import './external-individual-dialog';
import {ExternalIndividualDialog} from './external-individual-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {handleUsersNoLongerAssignedToCurrentCountry} from '../../../../common/common-methods';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {UnicefUser} from '../../../../../types/user-model';
import {Assessor, AssessorTypes} from '../../../../../types/assessment';
import {loadExternalIndividuals} from '../../../../../redux/actions/common-data';
import get from 'lodash-es/get';
import {fireEvent} from '../../../../utils/fire-custom-event';

/**
 * @customElement
 * @LitElement
 */

@customElement('external-individual')
export class ExternalIndividual extends connect(store)(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, labelAndvalueStylesLit];
  }
  render() {
    // language=HTML
    return html`
      ${SharedStylesLit}
      <style>
        a {
          cursor: pointer;
        }

        .padd-top {
          padding-top: 12px;
        }

        #emailInput {
         width: 100%;
        }
      </style>

      <div class="row-padding-v">
        <etools-dropdown id="externalIndiv"
          label="External Individual"
          .options="${this.externalIndividuals}"
          .selected="${this.assessor.user}"
          option-value="id"
          option-label="name"
          required
          auto-validate
          enable-none-option
          ?readonly="${this.isReadonly(this.editMode)}"
          trigger-value-change-event
          @etools-selected-item-changed="${this._setSelectedExternalIndividual}">
        </etools-dropdown>

        <div ?hidden="${!this.editMode}" class="padd-top">
          User not yet in the system? Add them <a @tap="${this.openAddDialog}">here</a>
        </div>

        <div class="row-padding-v">
          <div class="col col-6">
            <paper-input
                    id="emailInput"
                    value="${this.assessor.user_details.email}"
                    label="E-mail"
                    type="email"
                    readonly
                    placeholder="—"
                    maxlength="45">
              <iron-icon slot="prefix" icon="communication:email"></iron-icon>
            </paper-input>
          </div>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  assessor!: Assessor;

  @property({type: Array})
  externalIndividuals!: any[];

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: String})
  origAssessorType!: AssessorTypes;


  private dialogExtIndividual!: ExternalIndividualDialog;

  stateChanged(state: RootState) {
    if (get(state, 'app.routeDetails.subRouteName') !== 'details') {
      return;
    }

    this.populateExternalIndividualsDropdown(state);
  }

  private populateExternalIndividualsDropdown(state: RootState) {
    if (get(state, 'user.data')) {
      if (state.user!.data!.is_unicef_user) {

        const stateExternalIndivs = get(state, 'commonData.externalIndividuals');
        if (stateExternalIndivs) {

          this.externalIndividuals = [...stateExternalIndivs];
          if (this.origAssessorType === AssessorTypes.ExternalIndividual) {// ?????
            // check if already saved external individual exists on loaded data, if not they will be added
            handleUsersNoLongerAssignedToCurrentCountry(this.externalIndividuals,
              this.getSavedExternalDetailsAsArray(get(state, 'pageData.assessor')));
            this.externalIndividuals = [...this.externalIndividuals];
          }
        }
      } else {
        this.externalIndividuals = this.getSavedExternalDetailsAsArray(get(state, 'pageData.assessor'));
      }
    }
  }

  private getSavedExternalDetailsAsArray(currentAssessor: Assessor) {
    let savedExternal = currentAssessor.user_details;
    return !!(savedExternal && Object.keys(savedExternal).length > 0) ? [savedExternal] : [];
  }

  private openAddDialog() {
    if (!this.dialogExtIndividual) {
      this.createExternalIndividualDialog();
    }
    this.dialogExtIndividual.openDialog();
  }

  createExternalIndividualDialog() {
    this.dialogExtIndividual = document.createElement('external-individual-dialog') as ExternalIndividualDialog;
    this.dialogExtIndividual.setAttribute('id', 'externalIndividualDialog');
    this.dialogExtIndividual.toastEventSource = this;
    this.onDialogIndividualSaved = this.onDialogIndividualSaved.bind(this);
    this.dialogExtIndividual.addEventListener('external-individual-updated', this.onDialogIndividualSaved);
    document.querySelector('body')!.appendChild(this.dialogExtIndividual);
  }

  onDialogIndividualSaved(e: any) {
    const extIndId = e.detail.id;
    fireEvent(this, 'external-individuals-updated-in-redux');
    store.dispatch(loadExternalIndividuals(this.updateAssessor.bind(this, extIndId)));
  }

  updateAssessor(userId: string) {
    this.assessor = {
      ...this.assessor,
      user: userId,
      assessor_type: AssessorTypes.ExternalIndividual
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListeners();
  }

  removeListeners() {
    if (this.dialogExtIndividual) {
      this.dialogExtIndividual.removeEventListener('external-individual-updated', this.onDialogIndividualSaved);
      document.querySelector('body')!.removeChild(this.dialogExtIndividual);
    }
  }

  _setSelectedExternalIndividual(event: CustomEvent) {
    const selectedUser = event.detail.selectedItem;
    if (selectedUser) {
      this.assessor.user = selectedUser.id;
      this.assessor.user_details.email = selectedUser.email;
    } else {
      this.assessor.user_details.email = "";
      this.assessor.user = null;
    }
    this.requestUpdate();
  }

  validate() {
    if (!this.assessor.user) {
      (this.shadowRoot!.querySelector('#externalIndiv') as EtoolsDropdownEl).invalid = true;
      return false;
    }
    return true;
  }

  isReadonly(editMode: boolean) {
    return !editMode;
  }

  getAssessorForSave() {
    return {user: this.assessor.user};
  }

  getExternalIndividualName() {
    const extIndivDropdown = this.shadowRoot!.querySelector('#externalIndiv') as EtoolsDropdownEl;
    return extIndivDropdown ? (extIndivDropdown.selectedItem as UnicefUser).name : '';
  }

}
