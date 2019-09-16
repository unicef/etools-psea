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
    .content-header-actions .action {
      @apply --layout-horizontal;
      @apply --layout-end;
    }
    .content-header-actions paper-menu-button{
      padding: 0px;
    }
    .content-header-actions paper-button{
      padding: 0px;
      margin-left: 10px;
      font-weight: bold;
    }
    .content-header-actions paper-button iron-icon {
      margin-right: 10px;
    }
  </style>`;
