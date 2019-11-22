import {html} from 'lit-element';
// import '@polymer/iron-flex-layout/iron-flex-layout.js';
import {displayFlex, endAligned, endAlignedContent, endJustified, horizontal} from '@collaborne/lit-flexbox-literals';

/**
 * Used to style page content header title row actions child elements
 * (styling slotted content, using ::slotted will not work on Edge)
 */

// language=HTML
export const pageContentHeaderSlottedStyles = html`
  <style>
    .content-header-actions {
      ${displayFlex}
      ${horizontal}
      
      
      /*@apply --layout-horizontal;*/
      /*@apply --layout-end;*/
    }
  </style>`;
