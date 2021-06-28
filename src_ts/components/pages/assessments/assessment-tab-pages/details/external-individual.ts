import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import './external-individual-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {handleUsersNoLongerAssignedToCurrentCountry} from '../../../../common/common-methods';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {UnicefUser} from '../../../../../types/user-model';
import {Assessor, AssessorTypes} from '../../../../../types/assessment';
import {loadExternalIndividuals} from '../../../../../redux/actions/common-data';
import get from 'lodash-es/get';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {openDialog} from '../../../../utils/dialog';

/**
 * @customElement
 * @LitElement
 */

@customElement('external-individual')
export class ExternalIndividual extends connect(store)(LitElement) {
  static get styles() {
    return [labelAndvalueStylesLit, gridLayoutStylesLit];
  }
  render() {
    // language=HTML
    return html`
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
      ${SharedStylesLit}
      <div class="row-padding-v">
        <etools-dropdown
          id="externalIndiv"
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
          @etools-selected-item-changed="${this._setSelectedExternalIndividual}"
        >
        </etools-dropdown>

        <div ?hidden="${!this.editMode}" class="padd-top">
          User not yet in the system? Add them <a @tap="${this.openAddDialog}">here</a>
        </div>

        <div class="row-padding-v">
          <paper-input
            id="emailInput"
            value="${this.assessor.user_details.email}"
            label="E-mail"
            type="email"
            readonly
            placeholder="—"
            maxlength="45"
          >
            <iron-icon slot="prefix" icon="communication:email"></iron-icon>
          </paper-input>
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

  stateChanged(state: RootState) {
    if (get(state, 'app.routeDetails.subRouteName') !== 'details') {
      return;
    }

    this.setDefaultUserDetails();
    this.populateExternalIndividualsDropdown(state);
  }

  private populateExternalIndividualsDropdown(state: RootState) {
    if (get(state, 'user.data')) {
      if (state.user!.data!.is_unicef_user) {
        const stateExternalIndivs = get(state, 'commonData.externalIndividuals');
        if (stateExternalIndivs) {
          this.externalIndividuals = [...stateExternalIndivs];
          if (this.origAssessorType === AssessorTypes.ExternalIndividual) {
            // ?????
            // check if already saved external individual exists on loaded data, if not they will be added
            handleUsersNoLongerAssignedToCurrentCountry(
              this.externalIndividuals,
              this.getSavedExternalDetailsAsArray(get(state, 'pageData.assessor'))
            );
            this.externalIndividuals = [...this.externalIndividuals];
          }
        }
      } else {
        this.externalIndividuals = this.getSavedExternalDetailsAsArray(get(state, 'pageData.assessor'));
      }
    }
  }

  private getSavedExternalDetailsAsArray(currentAssessor: Assessor) {
    const savedExternal = currentAssessor.user_details;
    return savedExternal && Object.keys(savedExternal).length > 0 ? [savedExternal] : [];
  }

  private openAddDialog() {
    openDialog({
      dialog: 'external-individual-dialog',
      dialogData: {}
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }
      this.onDialogIndividualSaved(response.id);
      return null;
    });
  }

  private setDefaultUserDetails() {
    if (!this.assessor.user_details) {
      this.assessor.user_details = {email: ''} as UnicefUser;
    }
  }

  onDialogIndividualSaved(id: string) {
    fireEvent(this, 'external-individuals-updated-in-redux');
    store.dispatch(loadExternalIndividuals(this.updateAssessor.bind(this, id)));
  }

  updateAssessor(userId: string) {
    this.assessor = {
      ...this.assessor,
      user: userId,
      assessor_type: AssessorTypes.ExternalIndividual
    };
  }

  _setSelectedExternalIndividual(event: CustomEvent) {
    const selectedUser = event.detail.selectedItem;
    if (selectedUser) {
      this.assessor.user = selectedUser.id;
      this.assessor.user_details.email = selectedUser.email;
    } else {
      this.assessor.user_details.email = '';
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
