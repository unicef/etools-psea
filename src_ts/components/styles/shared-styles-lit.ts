import {html} from 'lit-element';

export const SharedStylesLit = html`
<style>
  :host {
    display: block;
    box-sizing: border-box;
    font-size: 16px;
  }

  *[hidden] {
    display: none !important;
  }

  h1, h2 {
    color: var(--primary-text-color);
    margin: 0;
    font-weight: normal;
  }

  h1 {
    text-transform: capitalize;
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  a {
    color: var(--primary-color);
    text-underline: none;
  }

  section {
    background-color: var(--primary-background-color);
  }

  etools-dropdown[readonly], etools-dropdown-multi[readonly], datepicker-lite[readonly] {
    --paper-input-container-underline: {
      display: none;
    };
    --paper-input-container-input-focus: {
      pointer-events: none;
    };
    --paper-input-container-label-focus: {
      pointer-events: none;
    };
    --paper-input-container-underline-focus: {
      display: none;
    };
  }

</style>
`;
