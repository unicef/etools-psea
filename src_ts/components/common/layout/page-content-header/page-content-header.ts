import {LitElement, html, property, customElement} from 'lit-element';
import {
  centerAligned,
  displayFlex,
  horizontal,
  startJustified,
  vertical
} from '@collaborne/lit-flexbox-literals';

/**
 * @LitElement
 * @customElement
 */
@customElement('page-content-header')
export class PageContentHeader extends LitElement {

  render() {
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          ${displayFlex}
          ${vertical}
          ${startJustified}
          background-color: var(--primary-background-color);
          padding: 0 24px;
          min-height: 85px;
          border-bottom: 1px solid var(--dark-divider-color);

          --page-title: {
            margin: 0;
            font-weight: normal;
            text-transform: capitalize;
            font-size: 24px;
            line-height: 1.3;
            min-height: 31px;
          }
        }

        :host([with-tabs-visible]) {
          min-height: 114px;
        }

        .content-header-row {
          ${displayFlex}
          ${horizontal}
          ${startJustified}
        }

        .title-row {
          ${displayFlex}
          ${centerAligned}
          margin: 30px 0 0;
          padding: 0 24px;
        }

        .title-row h1 {
          ${displayFlex}
          @apply --page-title;
        }

        .tabs {
          margin-top: 5px;
        }

        @media print {
          :host {
            padding: 0;
            border-bottom: none;
            min-height: 0 !important;
            margin-bottom: 16px;
          }

          .title-row h1 {
            font-size: 18px;
          }
        }

      </style>

      <div class="content-header-row title-row">
        <h1>
          <slot name="page-title"></slot>
        </h1>
        <slot name="title-row-actions"></slot>
      </div>

      <div class="content-header-row tabs" hidden$="[[!withTabsVisible]]">
        <slot name="tabs"></slot>
      </div>
    `;
  }

  @property({type: Boolean, reflect: true})
  withTabsVisible: boolean = false;

}
