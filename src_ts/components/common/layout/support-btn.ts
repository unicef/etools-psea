import {LitElement, html, customElement} from 'lit-element';
import '@polymer/iron-icons/communication-icons';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

/* eslint-disable max-len */

/**
 * @LitElement
 * @customElement
 */
@customElement('support-btn')
export class SupportBtn extends MatomoMixin(LitElement) {
  public render() {
    return html`
      <style>
        :host(:hover) {
          cursor: pointer;
        }
        a {
          color: inherit;
          text-decoration: none;
          font-size: 16px;
        }
        iron-icon {
          margin-right: 4px;
        }

        @media (max-width: 768px) {
          #supportTxt {
            display: none;
          }
        }
      </style>

      <a
        href="https://unicef.service-now.com/cc?id=sc_cat_item&sys_id=c8e43760db622450f65a2aea4b9619ad&sysparm_category=99c51053db0a6f40f65a2aea4b9619af"
        target="_blank"
        @tap="${this.trackAnalytics}"
        tracker="Support"
      >
        <iron-icon icon="communication:textsms"></iron-icon><span id="supportTxt">Support</span>
      </a>
    `;
  }
}
