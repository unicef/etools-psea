import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import './external-individual-dialog';
import {ExternalIndividualDialog} from './external-individual-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {isJsonStrMatch, cloneDeep} from '../../../../utils/utils';
import {handleUsersNoLongerAssignedToCurrentCountry} from '../../../../common/common-methods';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {UnicefUser} from '../../../../../types/user-model';
import {Assessor, AssessorTypes} from '../../../../../types/assessment';
import {updateAssessorData} from '../../../../../redux/actions/page-data';
import {loadExternalIndividuals} from '../../../../../redux/actions/common-data';
import get from 'lodash-es/get';

/**
 * @customElement
 * @LitElement
 */

@customElement('external-individual')
export class ExternalIndividual extends connect(store)(LitElement) {
  static get styles() {
    return [labelAndvalueStylesLit];
  }
  render() {
    // language=HTML
    return html`
      <style>
        a {
          cursor: pointer;
        }

        .padd-bottom {
          padding-bottom: 12px;
        }
      </style>
      ${SharedStylesLit}${gridLayoutStylesLit}
      <div class="row-padding-v">
        <etools-dropdown id="externalIndiv"
          class="padd-bottom"
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
        <span ?hidden="${!this.editMode}">
          User not yet in the system? Add them <a @tap="${this.openAddDialog}">here</a>
        </span>
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
        if (stateExternalIndivs &&
          !isJsonStrMatch(stateExternalIndivs, this.externalIndividuals)) {

          this.externalIndividuals = [...stateExternalIndivs];
          if (this.origAssessorType === AssessorTypes.ExternalIndividual) {// ?????
            // check if already saved external individual exists on loaded data, if not they will be added
            // (they might be missing if changed country)
            handleUsersNoLongerAssignedToCurrentCountry(this.externalIndividuals,
              this.getSavedExternalDetailsAsArray());
            this.externalIndividuals = [...this.externalIndividuals];
          }
        }
      } else {
        this.externalIndividuals = this.getSavedExternalDetailsAsArray();
      }
    }
  }

  private getSavedExternalDetailsAsArray() {
    let savedExternal = this.assessor.user_details;
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
    store.dispatch(loadExternalIndividuals(this.updateAssessor.bind(this, extIndId)));
  }

  updateAssessor(userId: string) {
    this.assessor.user = userId;
    this.assessor.assessor_type = AssessorTypes.ExternalIndividual;
    store.dispatch(updateAssessorData(cloneDeep(this.assessor)));
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
    } else {
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
