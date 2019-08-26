import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {LitElement, html} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import './staff-member';
import {StaffMemberEl} from './staff-member';

/**
 * @customElement
 * @polymer
 */
class ExternalIndividual extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>
      ${labelAndvalueStylesLit}${SharedStylesLit}${gridLayoutStylesLit}
      <div class="row-padding-v">
        <etools-dropdown label="Select External Individual">
        </etools-dropdown>
        <label class="paper-label">User not yet in the system? Add them <a @tap="${this.openAddDialog}">here</a></label>
      </div>
    `;
  }
  private dialogExternalMember: StaffMemberEl | null = null;

  private openAddDialog() {
    if (!this.dialogExternalMember) {
      this.dialogExternalMember = document.querySelector('body')!.querySelector('#dialogStaffMember');
      if (!this.dialogExternalMember) {
        this.dialogExternalMember = document.createElement('staff-member') as StaffMemberEl;
        this.dialogExternalMember.setAttribute('id', 'dialogStaffMember');
        document.querySelector('body')!.appendChild(this.dialogExternalMember);
      }
    }
    this.dialogExternalMember.isStaffMember = false;
    this.dialogExternalMember.openDialog();
  }

}

window.customElements.define('external-individual', ExternalIndividual)
