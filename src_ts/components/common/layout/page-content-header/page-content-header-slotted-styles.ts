import {html} from 'lit-element';
import {
  displayFlex,
  endJustified,
  flexFactor,
  horizontal
} from '@collaborne/lit-flexbox-literals';

/**
 * Used to style page content header title row actions child elements
 * (styling slotted content, using ::slotted will not work on Edge)
 */

// language=HTML
export const pageContentHeaderSlottedStyles = html`
  <style>
    .content-header-actions {
      ${displayFlex}
      ${flexFactor}
      ${horizontal}
      ${endJustified}
    }
  </style>`;
