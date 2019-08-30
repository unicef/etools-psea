import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {LitElement, html, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import './staff-member-dialog';
import {StaffMemberDialogEl} from './staff-member-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {isJsonStrMatch} from '../../../../utils/utils';

/**
 * @customElement
 * @polymer
 */
class ExternalIndividual extends connect(store)(LitElement) {
  render() {
    // language=HTML
    return html`
      <style>
        a {
          cursor: pointer;
        }
      </style>
      ${labelAndvalueStylesLit}${SharedStylesLit}${gridLayoutStylesLit}
      <div class="row-padding-v">
        <etools-dropdown label="Select External Individual"
          .options="${this.externalIndividuals}"
          .selected="${this.assessor.user}"
          option-value="id"
          option-label="name"
          required
          trigger-value-change-event
          @etools-selected-item-changed="${this._setSelectedExternalIndividual}">
        </etools-dropdown>
        <label class="paper-label">User not yet in the system? Add them <a @tap="${this.openAddDialog}">here</a></label>
      </div>
    `;
  }

  @property({type: Object})
  assessor!: {user: string| number | null};

  @property({type: Array})
  externalIndividuals!: any[]

  private dialogExternalMember!: StaffMemberDialogEl;

  stateChanged(state: RootState) {
    let stateExternalIndivs = state.commonData!.externalIndividuals;
    if (stateExternalIndivs && !isJsonStrMatch(stateExternalIndivs, this.externalIndividuals)) {
      this.externalIndividuals = [...stateExternalIndivs];
    }
  }

  private openAddDialog() {
    if (!this.dialogExternalMember) {
      this.dialogExternalMember = document.querySelector('body')!.querySelector('#dialogStaffMember') as StaffMemberDialogEl;
    }
    this.dialogExternalMember.isStaffMember = false;
    this.dialogExternalMember.openDialog();
  }


  _setSelectedExternalIndividual(event: CustomEvent) {
    let selectedUser = event.detail.selectedItem;
    if (selectedUser) {
      this.assessor.user = selectedUser.id;
    } else {
      this.assessor.user = null;
    }
    this.requestUpdate();
  }


  getAssessorForSave() {
    return {user: this.assessor.user};
  }

}
export {ExternalIndividual as ExternalIndividualElement}

window.customElements.define('external-individual', ExternalIndividual)
