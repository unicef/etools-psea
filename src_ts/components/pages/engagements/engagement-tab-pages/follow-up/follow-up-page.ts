import {LitElement, html} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';

class FollowUpPage extends LitElement {
  render() {
    return html`
      <etools-content-panel panel-title="Action Points">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_openDialog"
                icon="add">
          </paper-icon-button>
        </div>
      </etools-content-panel>
    `;
  }
}
window.customElements.define('follow-up-page', FollowUpPage);
