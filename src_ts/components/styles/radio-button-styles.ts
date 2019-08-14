import {html} from 'lit-element';
// language=HTML
export const radioButtonStyles = html`
  <style>
    paper-radio-button.red {
      --paper-radio-button-checked-color: var(--primary-shade-of-red);
      --paper-radio-button-unchecked-color: var(--primary-shade-of-red);
    }
    paper-radio-button.orange {
      --paper-radio-button-checked-color: orange;
      --paper-radio-button-unchecked-color: orange;
    }
    paper-radio-button.green {
      --paper-radio-button-checked-color: var(--primary-shade-of-green);
      --paper-radio-button-unchecked-color: var(--primary-shade-of-green);
    }
  </style>
`
