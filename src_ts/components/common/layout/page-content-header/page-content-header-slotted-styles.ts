import {html} from 'lit-element';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

/**
 * Used to style page content header title row actions child elements
 * (styling slotted content, using ::slotted will not work on Edge)
 */

// language=HTML
export const pageContentHeaderSlottedStyles = html`
  <style>
    .content-header-actions {
      @apply --layout-horizontal;
      @apply --layout-end;
    }
    @media (max-width: 576px) {
      .content-header-actions {
        --layout-horizontal_-_display: block;
      }
    }
  </style>`;
